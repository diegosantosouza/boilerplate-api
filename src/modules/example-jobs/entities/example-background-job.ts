export const EXAMPLE_BACKGROUND_JOBS_QUEUE = 'example-background-jobs';
export const DEFAULT_EXAMPLE_SCHEDULER_ID = 'example-background-jobs-default';

export enum ExampleBackgroundJobName {
  IMMEDIATE = 'example.immediate',
  DELAYED = 'example.delayed',
  RETRY_DEMO = 'example.retry-demo',
  SCHEDULED = 'example.scheduled',
}

export type ExampleBackgroundJobSource = 'api' | 'scheduler';

export type ExampleBackgroundJobData = {
  message: string;
  source: ExampleBackgroundJobSource;
  createdAt: string;
  failUntilAttempt?: number;
};

export type ExampleBackgroundJobResult = {
  processedAt: string;
  jobName: ExampleBackgroundJobName;
  attemptsMade: number;
  message: string;
};

export type ExampleBackgroundJobSummary = {
  id: string;
  name: ExampleBackgroundJobName;
  queueName: string;
};

export type ExampleJobSchedulerSummary = {
  id: string;
  key: string;
  next?: number;
  every?: number;
  pattern?: string;
};
