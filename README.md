# Boilerplate API

Production-ready Node.js API boilerplate with Express 5, TypeScript, MongoDB, Redis, BullMQ, and GCP Pub/Sub.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22+ |
| Language | TypeScript 5.8 |
| Framework | Express 5.1 |
| Database | MongoDB 7 (Mongoose 8) |
| Cache | Redis (ioredis) |
| Jobs | BullMQ |
| Messaging | GCP Pub/Sub |
| Validation | Zod |
| Logging | Pino |
| Tracing | OpenTelemetry |
| API Docs | zod-to-openapi (Swagger UI) |
| HTTP Client | undici (Node.js built-in) |
| Linter | Biome |
| Testing | Jest + Testcontainers |

## Features

- Clean Architecture (Controllers, UseCases, Repositories, Factories)
- Result Pattern with typed domain errors (neverthrow)
- RFC 7807 Problem Details error responses
- Zod schema validation (runtime + OpenAPI docs from single source)
- Graceful shutdown with health checks (liveness + readiness)
- Structured logging with trace correlation (Pino + OpenTelemetry)
- Prometheus metrics endpoint (`/metrics`)
- Namespace-token cache invalidation (atomic, O(1))
- Fail-open degradation (cache, rate limiter, Redis lock)
- Domain event bus for module decoupling
- Audit log middleware (automatic mutation logging)
- Module scaffolding CLI (generates ~30 files per module)
- Integration tests with real containers (Testcontainers)
- Multi-stage Docker build
- CI/CD with GitHub Actions

## Quick Start

### Prerequisites

- Node.js >= 22
- Docker and Docker Compose

### Setup

```bash
# Clone and install
git clone <repository-url>
cd boilerplate-api
npm install

# Start infrastructure (MongoDB, Redis, PubSub emulator, Jaeger)
docker compose up -d

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`.

### Endpoints

| URL | Description |
|---|---|
| `http://localhost:3000/healthcheck` | API health status |
| `http://localhost:3000/livez` | Liveness probe (Kubernetes) |
| `http://localhost:3000/readyz` | Readiness probe (checks MongoDB + Redis) |
| `http://localhost:3000/api-docs` | Swagger UI |
| `http://localhost:3000/api-docs.json` | OpenAPI JSON spec |
| `http://localhost:3000/metrics` | Prometheus metrics |
| `http://localhost:16686` | Jaeger UI (traces) |

## Commands

```bash
# Development
npm run dev                  # Start with hot-reload
npm run debug                # Start with debugger (port 9229)

# Testing
npm test                     # Unit tests
npm run test:integration     # Integration tests (requires Docker)
npm run test:coverage        # Unit tests with coverage
npm run test:watch           # Watch mode

# Code Quality
npm run code:check           # Biome lint + format check
npm run code:fix             # Auto-fix lint + format issues

# Build
npm run build                # Production build (esbuild)
npm start                    # Run production build

# Generators
npm run generate:module <name> [entity]   # Scaffold a new CRUD module
npm run script:generate-swagger           # Rebuild swagger.json

# Background Processes
npm run worker:example-background-jobs:dev    # BullMQ worker
npm run scheduler:example-background-jobs:dev # BullMQ scheduler
npm run consumer:example-sync:dev             # PubSub consumer
npm run cron:example-sync:dev                 # One-shot cron

# Utilities
npm run cache:clear          # Flush Redis cache
```

## Project Structure

```
src/
  index.ts                   # HTTP server entrypoint
  instrumentation.ts         # OpenTelemetry bootstrap
  router/                    # Express router assembly
  modules/                   # Business feature modules
    items/                   # Reference CRUD module
    example-jobs/            # BullMQ job examples
    example-sync/            # PubSub messaging example
  shared/                    # Cross-cutting abstractions
    adapters/                # Express route adapter, error handler
    audit/                   # Audit log interface + Pino implementation
    cache/                   # CacheProvider (Redis/Noop)
    config/                  # App, env, OpenAPI, swagger
    errors/                  # Domain errors (typed union)
    events/                  # Domain event bus
    helpers/                 # HTTP responses, Problem Details, Zod utils
    http/                    # HTTP client (undici)
    logger/                  # LoggerPort + Pino adapter
    messaging/               # MessageBroker interface
    middlewares/              # JWT auth, rate limiting, audit
    protocols/               # Controller, HttpResponse, DomainResult
    repository/              # BaseRepository (Mongoose)
  infrastructure/            # Concrete implementations
    database/                # MongoDB connection
    jobs/                    # BullMQ connection + queue registry
    messaging/               # GCP PubSub broker
    redis/                   # Rate limiter, Redis lock
  consumers/                 # PubSub consumers (standalone)
  workers/                   # BullMQ workers (standalone)
  schedulers/                # BullMQ schedulers (standalone)
  crons/                     # One-shot cron jobs (standalone)
  scripts/                   # CLI tools
tests/
  modules/                   # Unit tests
  shared/                    # Shared infrastructure tests
  integration/               # Integration tests (Testcontainers)
```

## Creating a New Module

```bash
npm run generate:module products product
```

This generates ~30 files with the full architecture: entity, schema, repository, 5 usecases, 5 controllers, 5 factories, DTOs with OpenAPI, domain events, cache constants, and entrypoint with route registration.

After generating:

1. Fill in TODO fields in entity, schema, and DTOs
2. Register routes in `src/router/index.ts`:
   ```typescript
   import { productRouter } from '../modules/products';
   mainRouter.use('/products', productRouter);
   ```
3. Register event handlers in `src/index.ts`:
   ```typescript
   import { registerProductEventHandlers } from './modules/products/events/product-event-handlers';
   registerProductEventHandlers();
   ```
4. Run `npm run dev`

## Architecture

### Module Layers (10 per module)

```
entities/       -> Domain types
schemas/        -> Mongoose schema
repositories/   -> Data access (extends BaseRepository)
dto/            -> Zod schemas + types (.openapi() metadata)
usecases/       -> Business logic (returns DomainResult<T>)
controllers/    -> Parse input, call usecase, .match() result
factories/      -> Dependency wiring (composition root)
entrypoints/    -> Express router + OpenAPI registration
events/         -> Domain event constants + handlers
constants/      -> Cache namespaces and key builders
```

### Request Flow

```
Request -> Express -> adaptRoute -> Controller -> UseCase -> Repository -> MongoDB
                                        |              |
                                    Zod.parse     CacheProvider
                                        |              |
                                  DomainResult    DomainEventBus
                                        |
                                    .match()
                                   /        \
                              ok(data)    domainErrorToResponse(err)
                                   \        /
                                    Response (JSON or RFC 7807)
```

### Key Design Decisions

- **Result Pattern over exceptions**: UseCases return `DomainResult<T>` (neverthrow) for domain errors. Infrastructure errors propagate as exceptions to the global error handler.
- **Factory DI over IoC container**: Each controller has a `makeXController()` factory. Simple, explicit, zero magic.
- **Fail-open over fail-closed**: Cache and rate limiter degrade to no-op/in-memory when Redis is down. The API stays available.
- **Single source of truth for API docs**: Zod schemas validate runtime input AND generate OpenAPI documentation.
- **Standalone process model**: Workers, consumers, crons, and schedulers are independent entrypoints with their own lifecycle.

## Environment Variables

See [`.env.example`](.env.example) for all available configuration. Variables are validated at startup with Zod -- invalid config causes an immediate exit with a clear error message.

## Docker

```bash
# Development infrastructure
docker compose up -d

# Build production image
docker build -t boilerplate-api .

# Run production
docker run -p 3000:3000 --env-file .env boilerplate-api
```

Services provided by `docker-compose.yml`:

| Service | Port | Purpose |
|---|---|---|
| MongoDB 7 | 27017 | Database |
| Redis | 6379 | Cache, rate limiting, BullMQ backend |
| PubSub Emulator | 9000 | GCP Pub/Sub local emulator |
| Jaeger | 16686 (UI), 4318 (OTLP) | Distributed tracing |

## Documentation

- [`docs/architecture.md`](docs/architecture.md) -- Detailed architecture documentation
- [`docs/bullmq-background-jobs.md`](docs/bullmq-background-jobs.md) -- Background jobs guide
- [`docs/integrations-and-messaging.md`](docs/integrations-and-messaging.md) -- Messaging and integrations
- [`CLAUDE.md`](CLAUDE.md) -- AI-assisted development guide

## License

ISC
