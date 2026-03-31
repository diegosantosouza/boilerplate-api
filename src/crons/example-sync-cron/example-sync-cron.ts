import '@/instrumentation';
import { makeDispatchExampleSyncUseCase } from '@/modules/example-sync';
import Log from '../../shared/logger/log';
import BaseCron from '../base.cron';

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
cron
  .start()
  .then(() => process.exit(0))
  .catch(error => {
    Log.error('Error running ExampleSyncCron', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  });
