import { MongoHelper } from '../infrastructure/database/mongo-helper';
import { env } from '../shared/config/env';
import Log from '../shared/logger/log';

abstract class BaseCron {
  protected abstract cronName: string;

  protected abstract handle(): Promise<void>;

  public async start(): Promise<void> {
    Log.info(`Starting execution of ${this.cronName} CronJob.`);

    let exitCode = 0;
    try {
      Log.info(`Connecting to MongoDB for ${this.cronName} CronJob.`);
      await MongoHelper.connect(String(env.mongo_uri), env.mongo_debug);
      Log.info(`MongoDB connected successfully for ${this.cronName} CronJob.`);

      await this.handle();

      Log.info(`Finalized execution of ${this.cronName} CronJob`);
    } catch (error) {
      Log.error(`${this.cronName} CronJob failed`, {
        error: error instanceof Error ? error.message : String(error),
      });
      exitCode = 1;
    } finally {
      Log.info(`Disconnecting from MongoDB for ${this.cronName} CronJob.`);
      await MongoHelper.disconnect();
      Log.info(
        `MongoDB disconnected successfully for ${this.cronName} CronJob.`
      );
      process.exit(exitCode);
    }
  }
}

export default BaseCron;
