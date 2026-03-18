# Integrations and Messaging

## External integrations
- `src/shared/http` centralizes HTTP transport, response wrapping and request exceptions.
- `src/shared/datasources` defines access configuration per external service.
- `src/shared/repository/default-external-crud-repository.ts` is the base class for external resource repositories.
- `src/shared/repository/example-sync-resource-repository.ts` is the reference implementation for a resource managed outside Mongo.

## Messaging
- `src/shared/messaging` exposes broker-agnostic contracts for publish and consume.
- `src/infrastructure/messaging/message-broker-factory.ts` resolves the concrete broker through `MESSAGING_DRIVER`.
- `src/infrastructure/messaging/gcp` contains the current GCP Pub/Sub adapter.
- Business code must depend on `MessagePublisher` / `MessageBroker`, never on `@google-cloud/pubsub`.

## Example flow
1. `src/crons/example-sync-cron/example-sync-cron.ts` calls `DispatchExampleSyncUseCase`.
2. The use case fetches resources from the external API through `ExampleSyncResourceRepository`.
3. The use case publishes one broker message per resource to `EXAMPLE_SYNC_DESTINATION`.
4. `src/consumers/example-sync-consumer/example-sync-consumer.ts` consumes from `EXAMPLE_SYNC_CONSUMER_DESTINATION`.

## Environment variables
- `MESSAGING_DRIVER`: current supported value is `gcp-pubsub`.
- `MESSAGING_GCP_PROJECT_ID`: GCP project id for the broker adapter.
- `EXAMPLE_SYNC_DESTINATION`: logical publish destination. Falls back to `EXAMPLE_SYNC_TOPIC`.
- `EXAMPLE_SYNC_CONSUMER_DESTINATION`: logical consume destination. Falls back to `EXAMPLE_SYNC_SUBSCRIPTION`.
- `EXAMPLE_EXTERNAL_API_URL`: base URL for the example external integration.
- `EXAMPLE_EXTERNAL_API_TOKEN`: optional bearer token for the example external integration.
- `EXAMPLE_EXTERNAL_API_ENDPOINT`: endpoint used by the example external repository. Defaults to `/resources`.
