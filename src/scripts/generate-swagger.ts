import fs from 'fs';
import path from 'path';

// Import all entrypoints to trigger registry.registerPath() calls
import '@/modules/items/entrypoints/item-http-entrypoint';
import '@/modules/example-jobs/entrypoints/example-job-http-entrypoint';
import '@/router/healthcheck';

import { generateOpenAPIDocument } from '@/shared/config/openapi-registry';

const OUTPUT_FILE = path.join(process.cwd(), 'swagger.json');

console.log('Generating Swagger JSON...');

try {
  const spec = generateOpenAPIDocument();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(spec, null, 2));
  console.log(`Swagger JSON generated successfully at: ${OUTPUT_FILE}`);
} catch (error) {
  console.error('Failed to generate Swagger JSON:', error);
  process.exit(1);
}
