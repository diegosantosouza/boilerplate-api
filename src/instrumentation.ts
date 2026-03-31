// IMPORTANT: This file must be imported before any other module so OTel can
// monkey-patch HTTP, gRPC, etc. We read process.env directly because importing
// @/shared/config/env would trigger side-effects and module loads before
// instrumentation is in place. Keep defaults in sync with envSchema in env.ts.

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'boilerplate-api';

const sdk = new NodeSDK({
  serviceName,

  traceExporter: otlpEndpoint
    ? new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
      })
    : undefined,

  metricReader: otlpEndpoint
    ? new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${otlpEndpoint}/v1/metrics`,
        }),
      })
    : undefined,

  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
    new PinoInstrumentation(),
  ],
});

sdk.start();

const shutdown = () => sdk.shutdown();
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
