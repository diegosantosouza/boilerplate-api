import { readFileSync } from 'node:fs';
import path from 'node:path';

const envPath = path.join(__dirname, '.test-env.json');
const testEnv = JSON.parse(readFileSync(envPath, 'utf-8'));
process.env.MONGO_URI = testEnv.MONGO_URI;
process.env.CACHE_URL = testEnv.CACHE_URL;
