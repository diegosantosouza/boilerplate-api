import Redis from 'ioredis';
import {
  type IRateLimiterRes,
  RateLimiterMemory,
  RateLimiterRedis,
} from 'rate-limiter-flexible';
import { env } from '@/shared/config/env';
import Log from '@/shared/logger/log';

export type { IRateLimiterRes };

class RateLimiterManager {
  private initialized = false;

  public global!: RateLimiterRedis | RateLimiterMemory;
  public public!: RateLimiterRedis | RateLimiterMemory;
  public authenticated!: RateLimiterRedis | RateLimiterMemory;
  public webhook!: RateLimiterRedis | RateLimiterMemory;

  public initialize(): void {
    if (this.initialized) return;

    try {
      const client = new Redis(env.cache_url, {
        lazyConnect: false,
        enableReadyCheck: false,
      });

      this.global = new RateLimiterRedis({
        storeClient: client,
        keyPrefix: 'rl_global',
        points: env.rate_limit_global_points,
        duration: env.rate_limit_global_duration,
        insuranceLimiter: new RateLimiterMemory({
          keyPrefix: 'rl_global_mem',
          points: env.rate_limit_global_points,
          duration: env.rate_limit_global_duration,
        }),
      });

      this.public = new RateLimiterRedis({
        storeClient: client,
        keyPrefix: 'rl_public',
        points: env.rate_limit_public_points,
        duration: env.rate_limit_public_duration,
        insuranceLimiter: new RateLimiterMemory({
          keyPrefix: 'rl_public_mem',
          points: env.rate_limit_public_points,
          duration: env.rate_limit_public_duration,
        }),
      });

      this.authenticated = new RateLimiterRedis({
        storeClient: client,
        keyPrefix: 'rl_auth',
        points: env.rate_limit_auth_points,
        duration: env.rate_limit_auth_duration,
        insuranceLimiter: new RateLimiterMemory({
          keyPrefix: 'rl_auth_mem',
          points: env.rate_limit_auth_points,
          duration: env.rate_limit_auth_duration,
        }),
      });

      this.webhook = new RateLimiterRedis({
        storeClient: client,
        keyPrefix: 'rl_webhook',
        points: env.rate_limit_webhook_points,
        duration: env.rate_limit_webhook_duration,
        insuranceLimiter: new RateLimiterMemory({
          keyPrefix: 'rl_webhook_mem',
          points: env.rate_limit_webhook_points,
          duration: env.rate_limit_webhook_duration,
        }),
      });

      this.initialized = true;
    } catch (error) {
      Log.warn(
        JSON.stringify({
          event: '[RateLimiter:initialize:warn]',
          data: {
            message:
              'Redis unavailable, falling back to in-memory rate limiters',
          },
        })
      );

      this.global = new RateLimiterMemory({
        keyPrefix: 'rl_global_mem',
        points: env.rate_limit_global_points,
        duration: env.rate_limit_global_duration,
      });

      this.public = new RateLimiterMemory({
        keyPrefix: 'rl_public_mem',
        points: env.rate_limit_public_points,
        duration: env.rate_limit_public_duration,
      });

      this.authenticated = new RateLimiterMemory({
        keyPrefix: 'rl_auth_mem',
        points: env.rate_limit_auth_points,
        duration: env.rate_limit_auth_duration,
      });

      this.webhook = new RateLimiterMemory({
        keyPrefix: 'rl_webhook_mem',
        points: env.rate_limit_webhook_points,
        duration: env.rate_limit_webhook_duration,
      });

      this.initialized = true;
    }
  }
}

export const RateLimiter = new RateLimiterManager();
