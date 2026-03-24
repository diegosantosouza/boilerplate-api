import Redis from 'ioredis';
import { env } from '@/shared/config/env';
import Log from '@/shared/logger/log';

class RedisLockManager {
  private client: Redis | null = null;
  private initialized = false;

  public initialize(): void {
    if (this.initialized) return;

    try {
      this.client = new Redis(env.cache_url, {
        lazyConnect: false,
        enableReadyCheck: false,
      });
      this.initialized = true;
    } catch (error) {
      Log.warn(
        JSON.stringify({
          event: '[RedisLock:initialize:warn]',
          data: { message: 'Redis lock unavailable, locks will be no-ops' },
        })
      );
    }
  }

  public async acquireLock(key: string, ttlSeconds: number = 60): Promise<boolean> {
    if (!this.client) return true; // no-op: always grant lock

    try {
      const result = await this.client.set(key, '1', 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (error) {
      Log.warn(
        JSON.stringify({
          event: '[RedisLock:acquireLock:error]',
          data: { key, error: error instanceof Error ? error.message : String(error) },
        })
      );
      return false;
    }
  }

  public async releaseLock(key: string): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.del(key);
    } catch (error) {
      Log.warn(
        JSON.stringify({
          event: '[RedisLock:releaseLock:error]',
          data: { key, error: error instanceof Error ? error.message : String(error) },
        })
      );
    }
  }

  public async getRaw<T>(key: string): Promise<T | null> {
    if (!this.client) return null;

    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  public async setRaw(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      Log.warn(
        JSON.stringify({
          event: '[RedisLock:setRaw:error]',
          data: { key, error: error instanceof Error ? error.message : String(error) },
        })
      );
    }
  }
}

export const RedisLock = new RedisLockManager();
