import BaseCron from '../base.cron';
import Log from '../../shared/logger/log';

class ExampleSyncCron extends BaseCron {
  protected cronName = 'ExampleSync';

  public async handle(): Promise<void> {
    Log.info('Running example sync cron job...');

    // TODO: Implement your cron job logic here

    Log.info('Example sync cron job completed.');
  }
}

const cron = new ExampleSyncCron();
cron.start()
  .then(() => process.exit(0))
  .catch(error => {
    Log.error('Error running ExampleSyncCron', error);
    process.exit(1);
  });
