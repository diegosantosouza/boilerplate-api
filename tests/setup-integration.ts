import { readFileSync } from 'fs';
import path from 'path';

const envPath = path.join(__dirname, '.test-env.json');
const testEnv = JSON.parse(readFileSync(envPath, 'utf-8'));
process.env.MONGO_URI = testEnv.MONGO_URI;
process.env.CACHE_URL = testEnv.CACHE_URL;
