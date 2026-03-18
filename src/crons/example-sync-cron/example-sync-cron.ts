import BaseCron from '../base.cron';
import Log from '../../shared/logger/log';
import { makeDispatchExampleSyncUseCase } from '@/modules/example-sync';

const dispatchExampleSyncUseCase = makeDispatchExampleSyncUseCase();

class ExampleSyncCron extends BaseCron {
  protected cronName = 'ExampleSync';

  public async handle(): Promise<void> {
    Log.info('Running example sync cron job...');

    const publishedMessages = await dispatchExampleSyncUseCase.execute();

    Log.info(
      `Example sync cron job completed. Published ${publishedMessages} messages.`
    );
  }
}

const cron = new ExampleSyncCron();
cron.start()
  .then(() => process.exit(0))
  .catch(error => {
    Log.error('Error running ExampleSyncCron', error);
    process.exit(1);
  });
