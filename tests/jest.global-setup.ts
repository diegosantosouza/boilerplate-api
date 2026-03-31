import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { setupContainers } from './setup-containers';

export default async function globalSetup() {
  await setupContainers();
  writeFileSync(
    path.join(__dirname, '.test-env.json'),
    JSON.stringify({
      MONGO_URI: process.env.MONGO_URI,
      CACHE_URL: process.env.CACHE_URL,
    })
  );
}
