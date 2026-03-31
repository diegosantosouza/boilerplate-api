import type { Job } from 'bullmq';
import Log from '@/shared/logger/log';
import type {
  ExampleBackgroundJobData,
  ExampleBackgroundJobName,
  ExampleBackgroundJobResult,
} from '../entities';

export class ProcessExampleBackgroundJobUseCase {
  public async execute(
    job: Job<ExampleBackgroundJobData, ExampleBackgroundJobResult, string>
  ): Promise<ExampleBackgroundJobResult> {
    await job.updateProgress(10);

    if (
      job.data.failUntilAttempt !== undefined &&
      job.attemptsMade < job.data.failUntilAttempt
    ) {
      throw new Error(
        `Simulated processing failure for job ${job.id} at attempt ${job.attemptsMade + 1}`
      );
    }

    await job.updateProgress(100);

    const result: ExampleBackgroundJobResult = {
      processedAt: new Date().toISOString(),
      jobName: job.name as ExampleBackgroundJobName,
      attemptsMade: job.attemptsMade,
      message: job.data.message,
    };

    Log.info(
      JSON.stringify({
        event: '[ProcessExampleBackgroundJobUseCase:execute]',
        data: {
          jobId: job.id,
          jobName: job.name,
          attemptsMade: job.attemptsMade,
          message: job.data.message,
        },
      })
    );

    return result;
  }
}
