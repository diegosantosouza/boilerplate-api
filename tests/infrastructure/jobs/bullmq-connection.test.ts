import { makeBullMqConnection, makeBullMqDefaultJobOptions } from '@/infrastructure/jobs/bullmq-connection';
import { env } from '@/shared/config/env';

describe('bullmq-connection', () => {
  it('should build redis connection settings from CACHE_URL', () => {
    const connection = makeBullMqConnection();

    expect(connection.host).toBeDefined();
    expect(connection.port).toBeDefined();
    expect(connection.db).toBeDefined();
  });

  it('should build default job options from env configuration', () => {
    const options = makeBullMqDefaultJobOptions();

    expect(options.attempts).toBe(env.bullmq_default_attempts);
    expect(options.backoff).toEqual({
      type: 'exponential',
      delay: env.bullmq_default_backoff_ms,
    });
  });
});
