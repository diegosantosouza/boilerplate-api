import { unlinkSync } from 'fs';
import path from 'path';
import { teardownContainers } from './setup-containers';

export default async function globalTeardown() {
  await teardownContainers();
  try {
    unlinkSync(path.join(__dirname, '.test-env.json'));
  } catch {
    // ignore if already cleaned up
  }
}
