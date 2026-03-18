import Redis from 'ioredis';
import { env } from '@/shared/config/env';
import Log from '@/shared/logger/log';
import { NoopCacheProvider } from './noop-cache-provider';
import { RedisCacheProvider } from './redis-cache-provider';

export interface CacheKeyOptions {
  namespace?: string;
}

export interface CacheSetOptions extends CacheKeyOptions {
  ttlSeconds?: number;
}

export interface CacheRememberOptions extends CacheSetOptions {}

export interface CacheProvider {
  initialize(): Promise<void>;
  get<T>(key: string, options?: CacheKeyOptions): Promise<T | null>;
  set(key: string, value: unknown, options?: CacheSetOptions): Promise<void>;
  delete(key: string, options?: CacheKeyOptions): Promise<void>;
  remember<T>(
    key: string,
    resolver: () => Promise<T>,
    options?: CacheRememberOptions
  ): Promise<T>;
  refreshNamespaceToken(namespace: string): Promise<void>;
  getNamespaceToken(namespace: string): Promise<string>;
}

class CacheManager implements CacheProvider {
  private initialized = false;
  private provider: CacheProvider = new NoopCacheProvider();

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const redisProvider = new RedisCacheProvider(new Redis(env.cache_url), {
        defaultTtlSeconds: env.cache_default_ttl_seconds,
        keyPrefix: env.cache_key_prefix,
      });

      await redisProvider.initialize();
      this.provider = redisProvider;
      Log.info(
        JSON.stringify({
          event: '[CacheManager:initialize:success]',
          data: {
            cacheUrl: env.cache_url,
            message: 'Redis cache initialized successfully',
          },
        })
      );
    } catch (error) {
      Log.warn(
        JSON.stringify({
          event: '[CacheManager:initialize:fail_open]',
          data: {
            cacheUrl: env.cache_url,
            error:
              error instanceof Error
                ? {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                  }
                : 'Unknown error',
            message: 'Redis unavailable, continuing with noop cache provider',
          },
        })
      );
    } finally {
      this.initialized = true;
    }
  }

  public async get<T>(
    key: string,
    options?: CacheKeyOptions
  ): Promise<T | null> {
    return this.provider.get<T>(key, options);
  }

  public async set(
    key: string,
    value: unknown,
    options?: CacheSetOptions
  ): Promise<void> {
    return this.provider.set(key, value, options);
  }

  public async delete(
    key: string,
    options?: CacheKeyOptions
  ): Promise<void> {
    return this.provider.delete(key, options);
  }

  public async remember<T>(
    key: string,
    resolver: () => Promise<T>,
    options?: CacheRememberOptions
  ): Promise<T> {
    return this.provider.remember<T>(key, resolver, options);
  }

  public async refreshNamespaceToken(namespace: string): Promise<void> {
    return this.provider.refreshNamespaceToken(namespace);
  }

  public async getNamespaceToken(namespace: string): Promise<string> {
    return this.provider.getNamespaceToken(namespace);
  }
}

export class Cache {
  private static instance: CacheManager = new CacheManager();

  public static getInstance(): CacheProvider {
    return this.instance;
  }

  public static async initialize(): Promise<CacheProvider> {
    await this.instance.initialize();
    return this.instance;
  }

  public static reset(): void {
    this.instance = new CacheManager();
  }
}
