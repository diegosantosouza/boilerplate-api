import '@/instrumentation';
import {
  makeExampleBackgroundJobService,
  makeUpsertExampleBackgroundJobSchedulerUseCase,
} from '@/modules/example-jobs/factories';
import Log from '@/shared/logger/log';

async function startScheduler(): Promise<void> {
  const exampleBackgroundJobService = makeExampleBackgroundJobService();

  try {
    const useCase = makeUpsertExampleBackgroundJobSchedulerUseCase();
    const scheduler = await useCase.execute();

    Log.info(
      JSON.stringify({
        event: '[ExampleBackgroundJobsScheduler:success]',
        data: scheduler,
      })
    );

    await exampleBackgroundJobService.close();
    process.exit(0);
  } catch (error) {
    Log.error(
      JSON.stringify({
        event: '[ExampleBackgroundJobsScheduler:error]',
        data: {
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  name: error.name,
                  stack: error.stack,
                }
              : 'Unknown error',
        },
      })
    );
    await exampleBackgroundJobService.close();
    process.exit(1);
  }
}

void startScheduler();
