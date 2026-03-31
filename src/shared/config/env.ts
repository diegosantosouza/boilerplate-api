import { z } from 'zod';

const booleanFromString = z
  .string()
  .transform(val => val === 'true')
  .default('false');

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database
  MONGO_URI: z.string().default('mongodb://localhost/boilerplate-api'),
  MONGO_DEBUG: booleanFromString,

  // Cache
  CACHE_URL: z.string().default('redis://localhost:6379'),
  CACHE_DEFAULT_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  CACHE_KEY_PREFIX: z.string().default('boilerplate'),

  // BullMQ
  BULLMQ_PREFIX: z.string().default('boilerplate-jobs'),
  BULLMQ_DEFAULT_ATTEMPTS: z.coerce.number().int().positive().default(3),
  BULLMQ_DEFAULT_BACKOFF_MS: z.coerce.number().int().positive().default(5000),
  BULLMQ_REMOVE_ON_COMPLETE_COUNT: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(10),
  BULLMQ_REMOVE_ON_FAIL_COUNT: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(100),
  BULLMQ_DEFAULT_WORKER_CONCURRENCY: z.coerce
    .number()
    .int()
    .positive()
    .default(5),
  BULLMQ_EXAMPLE_SCHEDULER_EVERY_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(60000),

  // Messaging
  MESSAGING_DRIVER: z.string().default('gcp-pubsub'),
  MESSAGING_GCP_PROJECT_ID: z.string().optional(),
  GCP_PROJECT_ID: z.string().optional(),
  EXAMPLE_SYNC_DESTINATION: z.string().optional(),
  EXAMPLE_SYNC_TOPIC: z.string().optional(),
  EXAMPLE_SYNC_CONSUMER_DESTINATION: z.string().optional(),
  EXAMPLE_SYNC_SUBSCRIPTION: z.string().optional(),

  // External API
  EXAMPLE_EXTERNAL_API_URL: z.string().url().optional(),
  EXAMPLE_EXTERNAL_API_TOKEN: z.string().default(''),
  EXAMPLE_EXTERNAL_API_ENDPOINT: z.string().default('/resources'),

  // Rate Limiting
  RATE_LIMIT_GLOBAL_POINTS: z.coerce.number().int().positive().default(200),
  RATE_LIMIT_GLOBAL_DURATION: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_PUBLIC_POINTS: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_PUBLIC_DURATION: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_AUTH_POINTS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_AUTH_DURATION: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_WEBHOOK_POINTS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_WEBHOOK_DURATION: z.coerce.number().int().positive().default(60),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),

  // OpenTelemetry
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default(''),
  OTEL_SERVICE_NAME: z.string().default('boilerplate-api'),

  // Auth
  DISABLE_AUTH: booleanFromString,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

const validated = parsed.data;

export const env = {
  node_env: validated.NODE_ENV,
  port: validated.PORT,
  mongo_uri: validated.MONGO_URI,
  mongo_debug: validated.MONGO_DEBUG,
  cache_url: validated.CACHE_URL,
  cache_default_ttl_seconds: validated.CACHE_DEFAULT_TTL_SECONDS,
  cache_key_prefix: validated.CACHE_KEY_PREFIX,
  bullmq_prefix: validated.BULLMQ_PREFIX,
  bullmq_default_attempts: validated.BULLMQ_DEFAULT_ATTEMPTS,
  bullmq_default_backoff_ms: validated.BULLMQ_DEFAULT_BACKOFF_MS,
  bullmq_remove_on_complete_count: validated.BULLMQ_REMOVE_ON_COMPLETE_COUNT,
  bullmq_remove_on_fail_count: validated.BULLMQ_REMOVE_ON_FAIL_COUNT,
  bullmq_default_worker_concurrency:
    validated.BULLMQ_DEFAULT_WORKER_CONCURRENCY,
  bullmq_example_scheduler_every_ms:
    validated.BULLMQ_EXAMPLE_SCHEDULER_EVERY_MS,
  messaging_driver: validated.MESSAGING_DRIVER,
  messaging_gcp_project_id:
    validated.MESSAGING_GCP_PROJECT_ID ?? validated.GCP_PROJECT_ID,
  example_sync_destination:
    validated.EXAMPLE_SYNC_DESTINATION ??
    validated.EXAMPLE_SYNC_TOPIC ??
    'example-sync',
  example_sync_consumer_destination:
    validated.EXAMPLE_SYNC_CONSUMER_DESTINATION ??
    validated.EXAMPLE_SYNC_SUBSCRIPTION ??
    'example-sync-sub',
  example_external_api_url: validated.EXAMPLE_EXTERNAL_API_URL,
  example_external_api_token: validated.EXAMPLE_EXTERNAL_API_TOKEN,
  example_external_api_endpoint: validated.EXAMPLE_EXTERNAL_API_ENDPOINT,
  rate_limit_global_points: validated.RATE_LIMIT_GLOBAL_POINTS,
  rate_limit_global_duration: validated.RATE_LIMIT_GLOBAL_DURATION,
  rate_limit_public_points: validated.RATE_LIMIT_PUBLIC_POINTS,
  rate_limit_public_duration: validated.RATE_LIMIT_PUBLIC_DURATION,
  rate_limit_auth_points: validated.RATE_LIMIT_AUTH_POINTS,
  rate_limit_auth_duration: validated.RATE_LIMIT_AUTH_DURATION,
  rate_limit_webhook_points: validated.RATE_LIMIT_WEBHOOK_POINTS,
  rate_limit_webhook_duration: validated.RATE_LIMIT_WEBHOOK_DURATION,
  log_level: validated.LOG_LEVEL,
  otel_exporter_otlp_endpoint: validated.OTEL_EXPORTER_OTLP_ENDPOINT,
  otel_service_name: validated.OTEL_SERVICE_NAME,
  disable_auth: validated.DISABLE_AUTH,
};

export type Env = typeof env;
