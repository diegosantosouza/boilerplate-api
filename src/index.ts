import './instrumentation';
import http from 'node:http';
import { createTerminus } from '@godaddy/terminus';
import { MongoHelper } from './infrastructure/database/mongo-helper';
import { registerItemEventHandlers } from './modules/items/events/item-event-handlers';
import { Cache } from './shared/cache/cache-provider';
import app from './shared/config/app';
import { env } from './shared/config/env';
import Log from './shared/logger/log';

async function startServer() {
  try {
    await Cache.initialize();
    await MongoHelper.connect(String(env.mongo_uri), env.mongo_debug);
    registerItemEventHandlers();

    const server = http.createServer(app);

    createTerminus(server, {
      signals: ['SIGTERM', 'SIGINT'],
      timeout: 30000,

      healthChecks: {
        '/livez': async () => {
          return;
        },
        '/readyz': async () => {
          await Promise.all([MongoHelper.ping(), Cache.ping()]);
        },
      },

      onSignal: async () => {
        Log.info('Server is shutting down...');
        await Promise.allSettled([
          MongoHelper.disconnect(),
          Cache.disconnect(),
        ]);
      },

      onShutdown: async () => {
        Log.info('Server has shut down gracefully');
      },

      logger: (msg, err) => {
        if (err) {
          Log.error(msg, { error: err.message });
        } else {
          Log.info(msg);
        }
      },
    });

    server.listen(env.port, () => {
      Log.info(`server running on port ${env.port}`);
    });
  } catch (error) {
    Log.error('Error starting server: ', {
      error: `${JSON.stringify(error)}`,
    });
    process.exit(1);
  }
}

startServer();
