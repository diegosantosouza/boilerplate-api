import { envSchema } from '@/shared/config/env';

describe('envSchema', () => {
  it('should parse valid environment variables', () => {
    const input = {
      NODE_ENV: 'production',
      PORT: '8080',
      MONGO_URI: 'mongodb://db:27017/myapp',
      MONGO_DEBUG: 'true',
      CACHE_URL: 'redis://cache:6379',
      LOG_LEVEL: 'info',
    };

    const result = envSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.NODE_ENV).toBe('production');
    expect(result.data.PORT).toBe(8080);
    expect(result.data.MONGO_URI).toBe('mongodb://db:27017/myapp');
    expect(result.data.MONGO_DEBUG).toBe(true);
    expect(result.data.CACHE_URL).toBe('redis://cache:6379');
    expect(result.data.LOG_LEVEL).toBe('info');
  });

  it('should apply defaults for missing optional values', () => {
    const result = envSchema.safeParse({});

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.NODE_ENV).toBe('development');
    expect(result.data.PORT).toBe(3000);
    expect(result.data.MONGO_URI).toBe('mongodb://localhost/boilerplate-api');
    expect(result.data.MONGO_DEBUG).toBe(false);
    expect(result.data.CACHE_URL).toBe('redis://localhost:6379');
    expect(result.data.CACHE_DEFAULT_TTL_SECONDS).toBe(60);
    expect(result.data.CACHE_KEY_PREFIX).toBe('boilerplate');
    expect(result.data.BULLMQ_PREFIX).toBe('boilerplate-jobs');
    expect(result.data.BULLMQ_DEFAULT_ATTEMPTS).toBe(3);
    expect(result.data.LOG_LEVEL).toBe('debug');
    expect(result.data.DISABLE_AUTH).toBe(false);
  });

  it('should reject invalid PORT (non-numeric string)', () => {
    const result = envSchema.safeParse({ PORT: 'abc' });

    expect(result.success).toBe(false);
  });

  it('should reject invalid NODE_ENV', () => {
    const result = envSchema.safeParse({ NODE_ENV: 'staging' });

    expect(result.success).toBe(false);
  });

  it('should reject negative PORT', () => {
    const result = envSchema.safeParse({ PORT: '-1' });

    expect(result.success).toBe(false);
  });

  it('should reject invalid LOG_LEVEL', () => {
    const result = envSchema.safeParse({ LOG_LEVEL: 'verbose' });

    expect(result.success).toBe(false);
  });

  it('should correctly transform MONGO_DEBUG="false" to false', () => {
    const result = envSchema.safeParse({ MONGO_DEBUG: 'false' });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.MONGO_DEBUG).toBe(false);
  });

  it('should correctly transform MONGO_DEBUG="true" to true', () => {
    const result = envSchema.safeParse({ MONGO_DEBUG: 'true' });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.MONGO_DEBUG).toBe(true);
  });

  it('should correctly transform DISABLE_AUTH="true" to true', () => {
    const result = envSchema.safeParse({ DISABLE_AUTH: 'true' });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.DISABLE_AUTH).toBe(true);
  });

  it('should reject invalid EXAMPLE_EXTERNAL_API_URL', () => {
    const result = envSchema.safeParse({
      EXAMPLE_EXTERNAL_API_URL: 'not-a-url',
    });

    expect(result.success).toBe(false);
  });

  it('should accept valid EXAMPLE_EXTERNAL_API_URL', () => {
    const result = envSchema.safeParse({
      EXAMPLE_EXTERNAL_API_URL: 'https://api.example.com',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.EXAMPLE_EXTERNAL_API_URL).toBe(
      'https://api.example.com'
    );
  });

  it('should coerce numeric strings for rate limit fields', () => {
    const result = envSchema.safeParse({
      RATE_LIMIT_GLOBAL_POINTS: '500',
      RATE_LIMIT_GLOBAL_DURATION: '120',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.RATE_LIMIT_GLOBAL_POINTS).toBe(500);
    expect(result.data.RATE_LIMIT_GLOBAL_DURATION).toBe(120);
  });

  it('should fallback EXAMPLE_SYNC_DESTINATION to undefined when not set', () => {
    const result = envSchema.safeParse({});

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.EXAMPLE_SYNC_DESTINATION).toBeUndefined();
    expect(result.data.EXAMPLE_SYNC_CONSUMER_DESTINATION).toBeUndefined();
  });
});
