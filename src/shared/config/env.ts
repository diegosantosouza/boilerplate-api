export const env = {
  node_env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  mongo_debug: Boolean(process.env.MONGO_DEBUG ?? false),
  mongo_uri: process.env.MONGO_URI ?? 'mongodb://localhost/boilerplate-api',
  cache_url: process.env.CACHE_URL ?? 'redis://localhost:6379',
  cache_default_ttl_seconds: Number(
    process.env.CACHE_DEFAULT_TTL_SECONDS ?? 60
  ),
  cache_key_prefix: process.env.CACHE_KEY_PREFIX ?? 'boilerplate',
  bullmq_prefix: process.env.BULLMQ_PREFIX ?? 'boilerplate-jobs',
  bullmq_default_attempts: Number(process.env.BULLMQ_DEFAULT_ATTEMPTS ?? 3),
  bullmq_default_backoff_ms: Number(
    process.env.BULLMQ_DEFAULT_BACKOFF_MS ?? 5000
  ),
  bullmq_remove_on_complete_count: Number(
    process.env.BULLMQ_REMOVE_ON_COMPLETE_COUNT ?? 10
  ),
  bullmq_remove_on_fail_count: Number(
    process.env.BULLMQ_REMOVE_ON_FAIL_COUNT ?? 100
  ),
  bullmq_default_worker_concurrency: Number(
    process.env.BULLMQ_DEFAULT_WORKER_CONCURRENCY ?? 5
  ),
  bullmq_example_scheduler_every_ms: Number(
    process.env.BULLMQ_EXAMPLE_SCHEDULER_EVERY_MS ?? 60000
  ),
  messaging_driver: process.env.MESSAGING_DRIVER ?? 'gcp-pubsub',
  messaging_gcp_project_id:
    process.env.MESSAGING_GCP_PROJECT_ID ?? process.env.GCP_PROJECT_ID,
  example_sync_destination:
    process.env.EXAMPLE_SYNC_DESTINATION ??
    process.env.EXAMPLE_SYNC_TOPIC ??
    'example-sync',
  example_sync_consumer_destination:
    process.env.EXAMPLE_SYNC_CONSUMER_DESTINATION ??
    process.env.EXAMPLE_SYNC_SUBSCRIPTION ??
    'example-sync-sub',
  example_external_api_url: process.env.EXAMPLE_EXTERNAL_API_URL,
  example_external_api_token:
    process.env.EXAMPLE_EXTERNAL_API_TOKEN ?? '',
  example_external_api_endpoint:
    process.env.EXAMPLE_EXTERNAL_API_ENDPOINT ?? '/resources',
};
