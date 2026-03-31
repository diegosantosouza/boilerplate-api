import '@/instrumentation';
import { type Job, QueueEvents, Worker } from 'bullmq';
import {
  makeBullMqConnection,
  makeBullMqWorkerOptions,
} from '@/infrastructure/jobs/bullmq-connection';
import {
  EXAMPLE_BACKGROUND_JOBS_QUEUE,
  type ExampleBackgroundJobData,
  ExampleBackgroundJobName,
  type ExampleBackgroundJobResult,
} from '@/modules/example-jobs/entities';
import { makeProcessExampleBackgroundJobUseCase } from '@/modules/example-jobs/factories/make-process-example-background-job-usecase';
import { env } from '@/shared/config/env';
import Log from '@/shared/logger/log';

const processExampleBackgroundJobUseCase =
  makeProcessExampleBackgroundJobUseCase();

const worker = new Worker<
  ExampleBackgroundJobData,
  ExampleBackgroundJobResult,
  string
>(
  EXAMPLE_BACKGROUND_JOBS_QUEUE,
  async (
    job: Job<ExampleBackgroundJobData, ExampleBackgroundJobResult, string>
  ) => processExampleBackgroundJobUseCase.execute(job),
  makeBullMqWorkerOptions(env.bullmq_default_worker_concurrency)
);

const queueEvents = new QueueEvents(EXAMPLE_BACKGROUND_JOBS_QUEUE, {
  connection: makeBullMqConnection(),
  prefix: env.bullmq_prefix,
});

worker.on('ready', () => {
  Log.info(
    JSON.stringify({
      event: '[ExampleBackgroundJobsWorker:ready]',
      data: {
        queueName: EXAMPLE_BACKGROUND_JOBS_QUEUE,
        message: 'BullMQ worker is ready',
      },
    })
  );
});

worker.on('error', error => {
  Log.error(
    JSON.stringify({
      event: '[ExampleBackgroundJobsWorker:error]',
      data: {
        queueName: EXAMPLE_BACKGROUND_JOBS_QUEUE,
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
});

queueEvents.on('completed', ({ jobId }) => {
  Log.info(
    JSON.stringify({
      event: '[ExampleBackgroundJobsWorker:completed]',
      data: {
        jobId,
      },
    })
  );
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  Log.warn(
    JSON.stringify({
      event: '[ExampleBackgroundJobsWorker:failed]',
      data: {
        jobId,
        failedReason,
      },
    })
  );
});

queueEvents.on('progress', ({ jobId, data }) => {
  Log.debug(
    JSON.stringify({
      event: '[ExampleBackgroundJobsWorker:progress]',
      data: {
        jobId,
        progress: data,
      },
    })
  );
});

const closeResources = async (): Promise<void> => {
  await Promise.all([worker.close(), queueEvents.close()]);
};

process.on('SIGINT', async () => {
  await closeResources();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeResources();
  process.exit(0);
});
