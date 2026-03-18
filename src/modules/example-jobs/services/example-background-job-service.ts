import { env } from '@/shared/config/env';
import {
  closeBullMqResources,
  getBullMqQueue,
} from '@/infrastructure/jobs/queue-registry';
import {
  DEFAULT_EXAMPLE_SCHEDULER_ID,
  EXAMPLE_BACKGROUND_JOBS_QUEUE,
  ExampleBackgroundJobData,
  ExampleBackgroundJobName,
  ExampleBackgroundJobResult,
  ExampleBackgroundJobSummary,
  ExampleJobSchedulerSummary,
} from '../entities';

type SchedulerInput = {
  schedulerId?: string;
  everyMs?: number;
  message?: string;
};

type ImmediateInput = {
  message: string;
};

type DelayedInput = {
  message: string;
  delayMs: number;
};

type RetryDemoInput = {
  message: string;
  failUntilAttempt?: number;
};

export class ExampleBackgroundJobService {
  private readonly queue = getBullMqQueue<
    ExampleBackgroundJobData,
    ExampleBackgroundJobResult,
    string
  >(EXAMPLE_BACKGROUND_JOBS_QUEUE);

  public async enqueueImmediate(
    input: ImmediateInput
  ): Promise<ExampleBackgroundJobSummary> {
    const job = await this.queue.add(
      ExampleBackgroundJobName.IMMEDIATE,
      this.buildJobData({
        message: input.message,
      })
    );

    return this.mapJob(job.id, ExampleBackgroundJobName.IMMEDIATE);
  }

  public async enqueueDelayed(
    input: DelayedInput
  ): Promise<ExampleBackgroundJobSummary> {
    const job = await this.queue.add(
      ExampleBackgroundJobName.DELAYED,
      this.buildJobData({
        message: input.message,
      }),
      {
        delay: input.delayMs,
      }
    );

    return this.mapJob(job.id, ExampleBackgroundJobName.DELAYED);
  }

  public async enqueueRetryDemo(
    input: RetryDemoInput
  ): Promise<ExampleBackgroundJobSummary> {
    const failUntilAttempt = input.failUntilAttempt ?? 2;
    const job = await this.queue.add(
      ExampleBackgroundJobName.RETRY_DEMO,
      this.buildJobData({
        message: input.message,
        failUntilAttempt,
      }),
      {
        attempts: Math.max(env.bullmq_default_attempts, failUntilAttempt + 1),
      }
    );

    return this.mapJob(job.id, ExampleBackgroundJobName.RETRY_DEMO);
  }

  public async upsertScheduler(
    input: SchedulerInput = {}
  ): Promise<{
    schedulerId: string;
    queueName: string;
    everyMs: number;
    firstJobId: string | null;
  }> {
    const schedulerId = input.schedulerId ?? DEFAULT_EXAMPLE_SCHEDULER_ID;
    const everyMs = input.everyMs ?? env.bullmq_example_scheduler_every_ms;

    const schedulerJob = await this.queue.upsertJobScheduler(
      schedulerId,
      {
        every: everyMs,
      },
      {
        name: ExampleBackgroundJobName.SCHEDULED,
        data: this.buildJobData({
          source: 'scheduler',
          message:
            input.message ?? 'Example scheduled background job from BullMQ',
        }),
      }
    );

    return {
      schedulerId,
      queueName: EXAMPLE_BACKGROUND_JOBS_QUEUE,
      everyMs,
      firstJobId: schedulerJob?.id ?? null,
    };
  }

  public async listSchedulers(): Promise<ExampleJobSchedulerSummary[]> {
    const schedulers = await (this.queue as any).getJobSchedulers(0, 50, true);

    return (schedulers as Array<Record<string, unknown>>).map(scheduler => ({
      id: String(scheduler.id),
      key: String(scheduler.key),
      next:
        typeof scheduler.next === 'number' ? scheduler.next : undefined,
      every:
        typeof scheduler.every === 'number' ? scheduler.every : undefined,
      pattern:
        typeof scheduler.pattern === 'string'
          ? scheduler.pattern
          : undefined,
    }));
  }

  public async removeScheduler(
    schedulerId: string
  ): Promise<{ schedulerId: string; removed: boolean }> {
    const removed = await this.queue.removeJobScheduler(schedulerId);

    return {
      schedulerId,
      removed,
    };
  }

  public async close(): Promise<void> {
    await closeBullMqResources();
  }

  private buildJobData(
    input: Partial<ExampleBackgroundJobData> & Pick<ExampleBackgroundJobData, 'message'>
  ): ExampleBackgroundJobData {
    return {
      source: input.source ?? 'api',
      createdAt: new Date().toISOString(),
      message: input.message,
      failUntilAttempt: input.failUntilAttempt,
    };
  }

  private mapJob(
    jobId: string | undefined,
    name: ExampleBackgroundJobName
  ): ExampleBackgroundJobSummary {
    return {
      id: jobId ?? 'unknown',
      name,
      queueName: EXAMPLE_BACKGROUND_JOBS_QUEUE,
    };
  }
}
