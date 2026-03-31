import { Router } from 'express';
import { z } from 'zod';
import { MongoHelper } from '@/infrastructure/database/mongo-helper';
import { Cache } from '@/shared/cache/cache-provider';
import { registry } from '@/shared/config/openapi-registry';

const HealthcheckResponseSchema = z
  .object({
    status: z.enum(['OK', 'DEGRADED']),
    timestamp: z.string(),
    uptime: z.number(),
    environment: z.string(),
    checks: z.record(z.enum(['UP', 'DOWN'])),
  })
  .openapi('HealthcheckResponse');

registry.registerPath({
  method: 'get',
  path: '/healthcheck',
  tags: ['Health'],
  summary: 'Check API health with dependency status',
  responses: {
    200: {
      description: 'All dependencies healthy',
      content: {
        'application/json': { schema: HealthcheckResponseSchema },
      },
    },
    503: {
      description: 'One or more dependencies degraded',
      content: {
        'application/json': { schema: HealthcheckResponseSchema },
      },
    },
  },
});

export const healthcheckRouter = Router();

healthcheckRouter.get('/healthcheck', async (_req, res) => {
  const checks: Record<string, string> = {};

  try {
    await MongoHelper.ping();
    checks.mongodb = 'UP';
  } catch {
    checks.mongodb = 'DOWN';
  }

  try {
    await Cache.ping();
    checks.redis = 'UP';
  } catch {
    checks.redis = 'DOWN';
  }

  const allUp = Object.values(checks).every((s) => s === 'UP');

  res.status(allUp ? 200 : 503).json({
    status: allUp ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks,
  });
});
