import { MongoHelper } from '../infrastructure/database/mongo-helper';
import { env } from '../shared/config/env';
import Log from '../shared/logger/log';

abstract class BaseCron {
  protected abstract cronName: string;

  protected abstract handle(): Promise<void>;

  public async start(): Promise<void> {
    Log.info(`Starting execution of ${this.cronName} CronJob.`);

    try {
      Log.info(`Connecting to MongoDB for ${this.cronName} CronJob.`);
      await MongoHelper.connect(String(env.mongo_uri), env.mongo_debug);
      Log.info(`MongoDB connected successfully for ${this.cronName} CronJob.`);

      await this.handle();

      Log.info(`Finalized execution of ${this.cronName} CronJob`);
      await MongoHelper.disconnect();
      process.exit(0);
    } finally {
      Log.info(`Disconnecting from MongoDB for ${this.cronName} CronJob.`);
      await MongoHelper.disconnect();
      Log.info(`MongoDB disconnected successfully for ${this.cronName} CronJob.`);

      process.exit(0);
    }
  }
}

export default BaseCron;
