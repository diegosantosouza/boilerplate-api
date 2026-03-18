# BullMQ Background Jobs

## O que foi adicionado
- Infraestrutura BullMQ sobre o Redis existente do projeto.
- Exemplo completo de producer, worker, delayed jobs, retries e job schedulers.
- Endpoints HTTP de exemplo em `/job-examples`.
- Scripts dedicados para worker e scheduler.

## Scripts
- `npm run worker:example-background-jobs`
- `npm run worker:example-background-jobs:dev`
- `npm run scheduler:example-background-jobs`
- `npm run scheduler:example-background-jobs:dev`

## Endpoints de exemplo
- `POST /job-examples/immediate`
- `POST /job-examples/delayed`
- `POST /job-examples/retry-demo`
- `POST /job-examples/schedulers`
- `GET /job-examples/schedulers`
- `DELETE /job-examples/schedulers/:schedulerId`

## Exemplos
### Job imediato
```bash
curl -X POST http://localhost:3000/job-examples/immediate \
  -H "Content-Type: application/json" \
  -d '{"message":"Run immediate job"}'
```

### Job com delay
```bash
curl -X POST http://localhost:3000/job-examples/delayed \
  -H "Content-Type: application/json" \
  -d '{"message":"Run delayed job","delayMs":10000}'
```

### Job com retry
```bash
curl -X POST http://localhost:3000/job-examples/retry-demo \
  -H "Content-Type: application/json" \
  -d '{"message":"Run retry demo","failUntilAttempt":2}'
```

### Scheduler recorrente
```bash
curl -X POST http://localhost:3000/job-examples/schedulers \
  -H "Content-Type: application/json" \
  -d '{"schedulerId":"example-background-jobs-default","everyMs":60000}'
```

## Como usar localmente
1. Suba o Redis do `docker-compose`.
2. Rode a API com `npm run dev`.
3. Rode o worker com `npm run worker:example-background-jobs:dev`.
4. Opcionalmente registre o scheduler com `npm run scheduler:example-background-jobs:dev` ou pelo endpoint.

## Observações
- BullMQ foi introduzido para jobs internos; o broker externo do projeto continua separado.
- O exemplo de scheduler usa `upsertJobScheduler`, que é a API atual da BullMQ para recorrência.
