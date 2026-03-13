export const env = {
  node_env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  mongo_debug: Boolean(process.env.MONGO_DEBUG ?? false),
  mongo_uri: process.env.MONGO_URI ?? 'mongodb://localhost/boilerplate-api',
  cache_url: process.env.CACHE_URL ?? 'redis://localhost:6379',
  gcp_project_id: process.env.GCP_PROJECT_ID,
  example_sync_topic: process.env.EXAMPLE_SYNC_TOPIC ?? 'example-sync',
  example_sync_subscription:
    process.env.EXAMPLE_SYNC_SUBSCRIPTION ?? 'example-sync-sub',
};
