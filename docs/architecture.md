# Architecture Overview

## Project Summary

Node.js/TypeScript boilerplate API built on Express 5, MongoDB, Redis, BullMQ, and GCP Pub/Sub. Designed as a production-ready starting point with clean architecture patterns, structured logging, observability, and module scaffolding.

**Stack**: Node.js 22+ | TypeScript 5.8 | Express 5.1 | MongoDB (Mongoose 8) | Redis (ioredis) | BullMQ | GCP Pub/Sub | Zod | Pino | OpenTelemetry

---

## Directory Structure

```
src/
  index.ts                 # HTTP server entrypoint (terminus, health checks)
  instrumentation.ts       # OpenTelemetry SDK bootstrap (must be imported first)
  router/                  # Express router assembly
  modules/                 # Business feature modules
    items/                 # Reference CRUD module (10 layers)
    example-jobs/          # BullMQ job management module
    example-sync/          # PubSub message dispatch/consume
  shared/                  # Cross-cutting abstractions
    adapters/              # Express route adapter, error handler
    cache/                 # CacheProvider interface + Redis/Noop implementations
    config/                # App, env validation, OpenAPI registry, swagger
    datasources/           # External API data sources (fluent builder)
    errors/                # Domain errors (discriminated union) + legacy Error classes
    events/                # Domain event bus (EventEmitter-backed)
    helpers/               # HTTP response helpers, problem details, Zod formatters
    audit/                 # Audit log interface + Pino implementation
    http/                  # HTTP client (undici-based, fluent builder)
    logger/                # LoggerPort interface + Pino adapter
    messaging/             # MessageBroker interface
    middlewares/            # JWT auth, rate limiting, audit log
    models/                # BaseModel type
    protocols/             # Controller, HttpResponse, DomainResult interfaces
    repository/            # BaseRepository (Mongoose) + external API repository
  infrastructure/          # Concrete implementations
    database/              # MongoHelper (singleton connection)
    jobs/                  # BullMQ connection, queue registry
    messaging/             # GCP PubSub broker + client
    redis/                 # Rate limiter manager, Redis lock
  consumers/               # PubSub message consumers (standalone processes)
  crons/                   # One-shot cron processes
  workers/                 # BullMQ job workers (standalone processes)
  schedulers/              # BullMQ scheduler setup processes
  scripts/                 # CLI tools (swagger gen, module scaffolding)
tests/
  modules/                 # Unit tests mirroring src/modules
  shared/                  # Unit tests for shared infrastructure
  integration/             # Integration tests with Testcontainers
  helpers/                 # Test utilities
```

---

## Architectural Patterns

### 1. Clean Architecture Layers

```
Request -> Router -> Controller -> UseCase -> Repository -> Database
                                      |
                                  CacheProvider
                                  DomainEventBus
```

- **Controllers** parse input with Zod, call usecases, and map results to HTTP responses
- **UseCases** contain business logic and return `DomainResult<T>` (never throw)
- **Repositories** handle data persistence (Mongoose) or external API calls
- **Factories** wire the dependency chain (no IoC container)

### 2. Result Pattern (neverthrow)

All usecases return `DomainResult<T> = Result<T, DomainError>` instead of throwing exceptions. Controllers use `.match()` for exhaustive handling:

```typescript
// UseCase
async execute(input): Promise<DomainResult<Item>> {
  const item = await this.repository.findById(id);
  if (!item) return err({ type: 'NOT_FOUND', message: 'Item not found' });
  return ok(item);
}

// Controller
return result.match(
  (item) => ok(item),
  (error) => domainErrorToResponse(error)  // RFC 7807 ProblemDetails
);
```

**DomainError types**: `NOT_FOUND | VALIDATION | CONFLICT | UNAUTHORIZED | FORBIDDEN | EXTERNAL_SERVICE | INTERNAL`

**Design decision**: Infrastructure errors (DB connection failures, timeouts) are NOT wrapped in Result. They propagate as exceptions to the global error handler middleware. Only domain-level errors use the Result pattern.

### 3. Port/Adapter (Hexagonal)

Interfaces (ports) decouple business logic from infrastructure:

| Port | Adapter(s) |
|---|---|
| `LoggerPort` | `PinoLogger` |
| `CacheProvider` | `RedisCacheProvider`, `NoopCacheProvider` |
| `MessageBroker` | `GcpPubSubBroker` |
| `DomainEventBus` | `LocalEventBus` (EventEmitter) |
| `AuditLogger` | `PinoAuditLogger` |
| `BaseRepository<T,C>` | Mongoose implementation |

### 4. Fail-Open Degradation

Redis-dependent features gracefully degrade when Redis is unavailable:

- **Cache**: Falls back to `NoopCacheProvider` (every call goes to DB)
- **Rate Limiter**: Each `RateLimiterRedis` has a `RateLimiterMemory` insurance fallback
- **Redis Lock**: Returns "lock acquired" (no-op) when Redis is unreachable

### 5. Namespace-Token Cache Invalidation

Instead of scanning/deleting individual cache keys after writes, the project uses a namespace token pattern:

1. Each cached key includes a namespace token (UUID) in its key composition
2. Write operations call `refreshNamespaceToken(namespace)` which generates a new UUID
3. All existing keys under that namespace become stale atomically (they reference the old token)
4. No key scanning required, O(1) invalidation

### 6. Factory-Based Dependency Injection

Each controller has a factory function (`makeXController()`) that wires the full dependency chain:

```typescript
export function makeItemCreateController() {
  const repository = new ItemRepository(ItemModel);
  const cache = Cache.getInstance();
  const usecase = new ItemCreateUseCase(repository, cache);
  return new ItemCreateHttpController(usecase);
}
```

### 7. Domain Events (Internal Event Bus)

Modules communicate through an in-process event bus (not to be confused with GCP Pub/Sub for inter-service messaging):

```typescript
// Usecase publishes after successful operation
await eventBus.publish({
  name: ItemEvents.CREATED,
  payload: item,
  occurredAt: new Date(),
});

// Handlers registered at boot (src/index.ts)
registerItemEventHandlers();
```

Handlers run asynchronously and are wrapped in try/catch -- a handler failure does not affect the request.

### 8. Audit Log Middleware

Automatically records all mutation requests (POST, PUT, PATCH, DELETE) without blocking the response:

```
Request → AuditMiddleware → next() → response finish event → auditLogger.log()
```

Each audit entry captures: `timestamp`, `userId` (from JWT), `action` (CREATE/UPDATE/DELETE), `resource`, `resourceId`, `method`, `path`, `statusCode`, `ip`, `userAgent`, `duration` (ms).

- `AuditLogger` interface with a single `log(entry)` method
- `PinoAuditLogger` logs via Pino with `{ audit: true }` flag for filtering
- Fire-and-forget: `.catch(() => {})` ensures logging failures never block responses
- GET requests are ignored (only mutations are audited)
- Future implementations can write to MongoDB, Elasticsearch, or external services

---

## Error Handling Strategy

### Two-Layer Error Handling

1. **Domain errors** (Result pattern): Usecases return `err({ type, message })`. Controllers map to RFC 7807 ProblemDetails via `domainErrorToResponse()`.

2. **Infrastructure/unexpected errors** (thrown exceptions): Caught by `errorHandlerMiddleware` which also produces RFC 7807 ProblemDetails with `Content-Type: application/problem+json`.

### RFC 7807 Response Format

All error responses follow this shape:

```json
{
  "type": "https://httpstatuses.com/404",
  "title": "Not Found",
  "status": 404,
  "detail": "Item not found",
  "instance": "/items/abc123",
  "errors": []
}
```

Zod validation errors include the `errors` array with per-field details.

---

## Observability

### Structured Logging (Pino)

- `LoggerPort` interface with `error/warn/info/debug/child` methods
- `PinoLogger` adapter with pino-pretty in development, JSON in production
- `pinoHttp` middleware for automatic HTTP request logging
- Child loggers available for per-request context

### OpenTelemetry

- `src/instrumentation.ts` must be imported before any other module
- Auto-instruments: Express, MongoDB, Redis, BullMQ, Pino
- Trace/span IDs automatically injected into Pino logs
- OTLP exporters configured via `OTEL_EXPORTER_OTLP_ENDPOINT` env var
- No-op when endpoint is not configured (zero overhead in dev)

### Prometheus Metrics

- `GET /metrics` endpoint serves Prometheus-format metrics via `prom-client`

---

## API Documentation (OpenAPI)

Swagger documentation is generated from Zod schemas using `@asteasolutions/zod-to-openapi`:

1. DTOs define Zod schemas with `.openapi('SchemaName')` metadata
2. Entrypoints register paths via `registry.registerPath({ ... })`
3. `generateOpenAPIDocument()` produces the OpenAPI 3.0 spec
4. Swagger UI served at `/api-docs`, raw JSON at `/api-docs.json`
5. In production, a pre-built `swagger.json` is loaded from disk (generated at build time)

**Single source of truth**: The same Zod schema validates runtime input AND generates API documentation.

---

## HTTP Client (undici)

External API calls use a custom HTTP client built on `undici` (Node.js 22 built-in, replacing axios):

- `Request` class: fluent builder with `baseUrl`, `headers`, `params`, `timeout`, `retry` support
- `Response<T>` class: wraps raw response with `ok()`, `failed()`, `json()`, `throw()`, `header()` methods
- `Http` class: higher-level facade with `withBasicAuth()` and convenience methods
- `DataSource` abstract class: per-service configuration with `before()` hook for auth headers

**Retry behavior**: Only retries on network errors (connection refused, DNS failure). HTTP error responses (4xx/5xx) are NOT retried.

**SSL**: In non-production environments, SSL certificate validation is disabled by default. Set `SSL_VALIDATE_CERTIFICATES=true` to enforce.

---

## Health Checks and Graceful Shutdown

Three endpoints serve different audiences:

**Kubernetes probes** (via `@godaddy/terminus`, bypass Express middleware):

| Endpoint | Type | Check |
|---|---|---|
| `GET /livez` | Liveness | Process is alive (always 200) |
| `GET /readyz` | Readiness | MongoDB + Redis ping |

These are minimal -- Kubernetes only checks the status code, not the body. They bypass the Express middleware stack (no CORS, no logging, no audit) for minimal overhead.

**Informational endpoint** (Express route, full middleware pipeline):

| Endpoint | Type | Response |
|---|---|---|
| `GET /healthcheck` | Status page | Rich JSON with `status`, `uptime`, `environment`, `checks: { mongodb, redis }` |

Returns 200 with `status: 'OK'` when all dependencies are UP, or 503 with `status: 'DEGRADED'` when any dependency is DOWN. Documented in OpenAPI/Swagger.

**Graceful shutdown** (`SIGTERM`/`SIGINT`):
1. Stop accepting new connections
2. Wait up to 30s for in-flight requests to drain
3. Close MongoDB and Redis connections
4. Exit cleanly

---

## Environment Configuration

All environment variables are validated at startup using a Zod schema (`envSchema`). Invalid or missing required variables cause an immediate `process.exit(1)` with a clear error message.

Key categories: Server, Database, Cache, BullMQ, Messaging, External API, Rate Limiting, Logging, Auth, OpenTelemetry.

Boolean env vars use a string-to-boolean transform (`"true"` -> `true`, anything else -> `false`), fixing the common `Boolean("false") === true` bug.

---

## Standalone Processes

The project supports multiple process types, each with its own entrypoint:

| Process | Entrypoint | Purpose |
|---|---|---|
| HTTP Server | `src/index.ts` | API requests |
| Consumer | `src/consumers/*/` | GCP PubSub message processing |
| Worker | `src/workers/*/` | BullMQ job processing |
| Scheduler | `src/schedulers/*/` | BullMQ repeatable job setup |
| Cron | `src/crons/*/` | One-shot tasks (connect, run, exit) |

All are built independently by esbuild and can be deployed as separate containers.

---

## Module Generator

`npm run generate:module <name> [entity]` scaffolds a complete CRUD module with ~30 files:

- Entity, Mongoose schema, repository
- 5 usecases (create, show, update, delete, list) with Result pattern
- 5 controllers with Zod validation
- 5 factories
- DTOs with OpenAPI metadata
- Domain events (constants + handlers)
- Entrypoint with OpenAPI route registration
- Unit tests

After generation, manually register the routes in `src/router/index.ts` and event handlers in `src/index.ts`.

---

## Testing Strategy

### Unit Tests (`npm test`)

- Jest 30 with ts-jest
- Mock dependencies via `jest.Mocked<T>` (inline, no fixtures library)
- Test usecases in isolation (mock repository + cache)
- Verify both success (`isOk()`) and error (`isErr()`) paths
- Timeout: 10s, maxWorkers: 50%

### Integration Tests (`npm run test:integration`)

- **Testcontainers** spins up real MongoDB 7 + Redis containers via Docker
- **supertest** for HTTP-level testing against the Express app
- Sequential execution (`maxWorkers: 1`) to avoid container port conflicts
- Timeout: 30s per test

**Container lifecycle**:
1. `jest.global-setup.ts` starts MongoDB + Redis containers, writes connection URIs to `.test-env.json`
2. `setup-integration.ts` (setupFilesAfterEnv) reads `.test-env.json` and sets `process.env` in each worker
3. `jest.global-teardown.ts` stops containers and deletes `.test-env.json`

**Test helpers** (`tests/helpers/db-helper.ts`):
- `connectTestDb()` / `disconnectTestDb()` -- Mongoose connection management
- `clearCollections()` -- wipes all collections between tests for isolation

**Existing integration test suites**:
- `items/items-crud.integration.test.ts` -- Full HTTP CRUD (POST, GET, PATCH, DELETE, list with filters, 404/400 error paths)
- `cache/cache-redis.integration.test.ts` -- CacheProvider against real Redis (set/get, delete, remember, TTL expiry)

### CI Pipeline

Three parallel GitHub Actions jobs:

| Job | Steps |
|---|---|
| `test` | Install, unit tests (`npm test`), Biome check (`npx biome check`) |
| `integration-test` | Install, integration tests (Testcontainers, requires Docker) |
| `build` | Install, `npm run build`, Docker image build |

All jobs run on Node.js 22.x with `DISABLE_AUTH=true`.

---

## Tooling

### Linting and Formatting (Biome)

Biome replaces ESLint + Prettier as a single, faster tool (written in Rust):

- **Config**: `biome.json` (v2.4.9)
- **Style**: Single quotes, semicolons, 2-space indent, 80-char line width, ES5 trailing commas
- **Linting**: Recommended rules, `noExplicitAny` set to warn
- **Import organization**: Enabled (auto-sorts imports)
- **Commands**: `npm run code:check` (lint + format), `npm run code:fix` (auto-fix)

### Build System (esbuild)

- Builds 5 independent entry-point groups: main server, consumers, crons, workers, schedulers
- `packages: 'external'` -- node_modules are NOT bundled (smaller output, use Docker `npm ci --omit=dev`)
- Minification only in production (`NODE_ENV=production`)

### Docker

Multi-stage build (`node:22-alpine`):
1. Builder stage: `npm ci` + `npm run build`
2. Production stage: copies `dist/`, `package*.json`, `swagger.json`
3. `docker-compose.yml` provides: MongoDB 7, Redis, GCP PubSub emulator, Jaeger (OTLP trace collector)

---

## Middleware Pipeline

Request processing order in `src/shared/config/app.ts`:

```
cors -> json -> pinoHttp -> auditMiddleware -> routes -> errorHandlerMiddleware
```

1. **CORS**: Permissive by default
2. **JSON body parsing**: Express built-in
3. **pinoHttp**: Structured HTTP request/response logging
4. **Audit middleware**: Records mutations (fire-and-forget)
5. **Routes**: Business logic via controllers
6. **Error handler**: Catches all uncaught errors, produces RFC 7807

---

## Points of Attention

### Security

1. **JWT auth middleware decodes without verification**: `jwtAuthMiddleware` base64-decodes the JWT payload without verifying the signature. Any well-formed token is accepted. This is by design for the boilerplate (use `DISABLE_AUTH=true` for testing) but **must be replaced with real verification** (e.g., `jose`, Auth0, Firebase) before production.

2. **Rate limiting is not wired to routes by default**: The 4 rate limiter middlewares (global, public, authenticated, webhook) exist but are not applied to any route in the current router. They must be explicitly added per-route or globally in `app.ts`.

### Consistency

3. **Legacy Error classes coexist with DomainError**: `NotFoundError`, `ServerError`, etc. remain in `src/shared/errors/` but are no longer used by the items module (which uses `DomainError` discriminated union). They still exist for backward compatibility and are referenced by `http-helper.ts`.

4. **`example-jobs` module does not use Result Pattern**: Unlike the `items` module, the `example-jobs` usecases return raw `Promise<Output>` and throw exceptions. Controllers don't use `.match()`. This is an inconsistency -- new modules should follow the `items` pattern.
