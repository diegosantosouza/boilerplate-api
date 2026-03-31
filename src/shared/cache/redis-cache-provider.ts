import { randomUUID } from 'node:crypto';
import type Redis from 'ioredis';
import Log from '@/shared/logger/log';
import type {
  CacheKeyOptions,
  CacheProvider,
  CacheRememberOptions,
  CacheSetOptions,
} from './cache-provider';

type RedisCacheProviderConfig = {
  defaultTtlSeconds: number;
  keyPrefix: string;
};

export class RedisCacheProvider implements CacheProvider {
  constructor(
    private readonly client: Redis,
    private readonly config: RedisCacheProviderConfig
  ) {}

  public async initialize(): Promise<void> {
    await this.client.ping();
  }

  public async ping(): Promise<void> {
    await this.client.ping();
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }

  public async get<T>(
    key: string,
    options?: CacheKeyOptions
  ): Promise<T | null> {
    try {
      const cacheKey = await this.buildKey(key, options);
      const data = await this.client.get(cacheKey);

      if (!data) {
        this.log('cache_miss', { key: cacheKey });
        return null;
      }

      this.log('cache_hit', { key: cacheKey });
      return JSON.parse(data) as T;
    } catch (error) {
      this.logError('cache_error', key, error);
      return null;
    }
  }

  public async set(
    key: string,
    value: unknown,
    options?: CacheSetOptions
  ): Promise<void> {
    try {
      const cacheKey = await this.buildKey(key, options);
      const ttlSeconds = options?.ttlSeconds ?? this.config.defaultTtlSeconds;
      const serializedValue = JSON.stringify(value);

      await this.client.set(cacheKey, serializedValue, 'EX', ttlSeconds);
      this.log('cache_set', { key: cacheKey, ttlSeconds });
    } catch (error) {
      this.logError('cache_error', key, error);
    }
  }

  public async delete(key: string, options?: CacheKeyOptions): Promise<void> {
    try {
      const cacheKey = await this.buildKey(key, options);
      await this.client.del(cacheKey);
    } catch (error) {
      this.logError('cache_error', key, error);
    }
  }

  public async remember<T>(
    key: string,
    resolver: () => Promise<T>,
    options?: CacheRememberOptions
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const freshValue = await resolver();
    await this.set(key, freshValue, options);
    return freshValue;
  }

  public async refreshNamespaceToken(namespace: string): Promise<void> {
    try {
      const tokenKey = this.buildNamespaceTokenKey(namespace);
      await this.client.set(tokenKey, this.generateNamespaceToken());
    } catch (error) {
      this.logError('cache_error', namespace, error);
    }
  }

  public async getNamespaceToken(namespace: string): Promise<string> {
    try {
      const tokenKey = this.buildNamespaceTokenKey(namespace);
      const token = await this.client.get(tokenKey);

      if (token) {
        return token;
      }

      const newToken = this.generateNamespaceToken();
      const wasCreated = await this.client.set(tokenKey, newToken, 'NX');

      if (wasCreated === 'OK') {
        return newToken;
      }

      const currentToken = await this.client.get(tokenKey);
      return currentToken ?? newToken;
    } catch (error) {
      this.logError('cache_error', namespace, error);
      return 'fallback';
    }
  }

  private async buildKey(
    key: string,
    options?: CacheKeyOptions
  ): Promise<string> {
    if (!options?.namespace) {
      return `${this.config.keyPrefix}:${key}`;
    }

    const token = await this.getNamespaceToken(options.namespace);

    return `${this.config.keyPrefix}:${options.namespace}:t_${token}:${key}`;
  }

  private buildNamespaceTokenKey(namespace: string): string {
    return `${this.config.keyPrefix}:namespace:${namespace}:token`;
  }

  private generateNamespaceToken(): string {
    return randomUUID().replace(/-/g, '');
  }

  private log(event: string, data: Record<string, unknown>): void {
    Log.debug(
      JSON.stringify({
        event: `[RedisCacheProvider:${event}]`,
        data,
      })
    );
  }

  private logError(event: string, key: string, error: unknown): void {
    Log.warn(
      JSON.stringify({
        event: `[RedisCacheProvider:${event}]`,
        data: {
          key,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  name: error.name,
                  stack: error.stack,
                }
              : 'Unknown error',
        },
      })
    );
  }
}
