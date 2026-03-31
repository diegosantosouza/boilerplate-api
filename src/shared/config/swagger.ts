import fs from 'node:fs';
import path from 'node:path';
import Log from '@/shared/logger/log';

// Import all entrypoints to trigger registry.registerPath() calls
import '@/modules/items/entrypoints/item-http-entrypoint';
import '@/modules/example-jobs/entrypoints/example-job-http-entrypoint';
import '@/router/healthcheck';

import { generateOpenAPIDocument } from './openapi-registry';

let spec: object;

if (process.env.NODE_ENV !== 'development') {
  const swaggerPath = path.resolve(process.cwd(), 'swagger.json');
  if (fs.existsSync(swaggerPath)) {
    try {
      spec = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
      Log.info('Loaded static Swagger JSON');
    } catch (error) {
      Log.error('Failed to load static Swagger JSON', {
        error: error instanceof Error ? error.message : String(error),
      });
      spec = generateOpenAPIDocument();
    }
  } else {
    Log.warn(
      'Swagger JSON not found in production. Falling back to dynamic generation.'
    );
    spec = generateOpenAPIDocument();
  }
} else {
  spec = generateOpenAPIDocument();
}

export const swaggerSpec = spec;
