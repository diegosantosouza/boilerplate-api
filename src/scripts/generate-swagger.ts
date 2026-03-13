import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { options } from '../shared/config/swagger';

const OUTPUT_FILE = path.join(process.cwd(), 'swagger.json');

console.log('Generating Swagger JSON...');

try {
  const spec = swaggerJsdoc(options);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(spec, null, 2));
  console.log(`Swagger JSON generated successfully at: ${OUTPUT_FILE}`);
} catch (error) {
  console.error('Failed to generate Swagger JSON:', error);
  process.exit(1);
}
