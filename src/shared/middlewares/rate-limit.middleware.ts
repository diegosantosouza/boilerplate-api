import type { NextFunction, Request, Response } from 'express';
import { RateLimiterRes } from 'rate-limiter-flexible';
import { RateLimiter } from '@/infrastructure/redis/rate-limiter';
import { env } from '@/shared/config/env';

type Limiter = {
  consume: (key: string, points?: number) => Promise<RateLimiterRes>;
};

function getIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(',')[0];
    return first.trim();
  }
  return req.ip ?? 'unknown';
}

function createMiddleware(
  getLimiter: () => Limiter,
  getKey: (req: Request) => string,
  getPoints: () => number
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await getLimiter().consume(getKey(req));
      res.setHeader('RateLimit-Limit', getPoints());
      res.setHeader('RateLimit-Remaining', result.remainingPoints);
      res.setHeader(
        'RateLimit-Reset',
        Math.ceil((Date.now() + result.msBeforeNext) / 1000)
      );
      next();
    } catch (error) {
      if (error instanceof RateLimiterRes) {
        res.setHeader('Retry-After', Math.ceil(error.msBeforeNext / 1000));
        res
          .status(429)
          .json({ message: 'Too many requests, please try again later.' });
        return;
      }
      // Fail-open: unexpected errors do not block requests
      next();
    }
  };
}

export const globalRateLimiter = createMiddleware(
  () => RateLimiter.global,
  req => getIp(req),
  () => env.rate_limit_global_points
);

export const publicRateLimiter = createMiddleware(
  () => RateLimiter.public,
  req => getIp(req),
  () => env.rate_limit_public_points
);

export const authenticatedRateLimiter = createMiddleware(
  () => RateLimiter.authenticated,
  req => req.authUser?.userId ?? getIp(req),
  () => env.rate_limit_auth_points
);

export const webhookRateLimiter = createMiddleware(
  () => RateLimiter.webhook,
  req => getIp(req),
  () => env.rate_limit_webhook_points
);
