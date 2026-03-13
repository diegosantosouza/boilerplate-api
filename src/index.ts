import Log from './shared/logger/log';
import { MongoHelper } from './infrastructure/database/mongo-helper';
import { Cache } from './shared/cache/cache-provider';
import app from './shared/config/app';
import { env } from './shared/config/env';

async function startServer() {
  try {
    await Cache.getInstance();
    await MongoHelper.connect(String(env.mongo_uri), env.mongo_debug);
    app.listen(env.port, () => Log.info(`server running on port ${env.port}`));
  } catch (error) {
    Log.error('Error starting server: ', { error: `${JSON.stringify(error)}` });
    process.exit(1);
  }
}

startServer();
