import { URL } from 'node:url';
import type { JobsOptions, QueueOptions, WorkerOptions } from 'bullmq';
import type { RedisOptions } from 'ioredis';
import { env } from '@/shared/config/env';

const parseRedisDatabase = (pathname: string): number => {
  const database = pathname.replace('/', '');
  return database ? Number(database) : 0;
};

export const makeBullMqConnection = (): RedisOptions => {
  const redisUrl = new URL(env.cache_url);

  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    db: parseRedisDatabase(redisUrl.pathname),
    tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
  };
};

export const makeBullMqDefaultJobOptions = (): JobsOptions => ({
  attempts: env.bullmq_default_attempts,
  backoff: {
    type: 'exponential',
    delay: env.bullmq_default_backoff_ms,
  },
  removeOnComplete: {
    count: env.bullmq_remove_on_complete_count,
  },
  removeOnFail: {
    count: env.bullmq_remove_on_fail_count,
  },
});

export const makeBullMqQueueOptions = (): Omit<QueueOptions, 'connection'> & {
  connection: RedisOptions;
} => ({
  connection: makeBullMqConnection(),
  prefix: env.bullmq_prefix,
  defaultJobOptions: makeBullMqDefaultJobOptions(),
});

export const makeBullMqWorkerOptions = (
  concurrency = env.bullmq_default_worker_concurrency
): Omit<WorkerOptions, 'connection'> & {
  connection: RedisOptions;
} => ({
  connection: makeBullMqConnection(),
  prefix: env.bullmq_prefix,
  concurrency,
});
