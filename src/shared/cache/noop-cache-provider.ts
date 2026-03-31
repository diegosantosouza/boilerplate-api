import type {
  CacheKeyOptions,
  CacheProvider,
  CacheRememberOptions,
  CacheSetOptions,
} from './cache-provider';

export class NoopCacheProvider implements CacheProvider {
  public async initialize(): Promise<void> {
    return Promise.resolve();
  }

  public async ping(): Promise<void> {
    return Promise.resolve();
  }

  public async disconnect(): Promise<void> {
    return Promise.resolve();
  }

  public async get<T>(
    _key: string,
    _options?: CacheKeyOptions
  ): Promise<T | null> {
    return null;
  }

  public async set(
    _key: string,
    _value: unknown,
    _options?: CacheSetOptions
  ): Promise<void> {
    return Promise.resolve();
  }

  public async delete(_key: string, _options?: CacheKeyOptions): Promise<void> {
    return Promise.resolve();
  }

  public async remember<T>(
    _key: string,
    resolver: () => Promise<T>,
    _options?: CacheRememberOptions
  ): Promise<T> {
    return resolver();
  }

  public async refreshNamespaceToken(_namespace: string): Promise<void> {
    return Promise.resolve();
  }

  public async getNamespaceToken(_namespace: string): Promise<string> {
    return 'noop';
  }
}
