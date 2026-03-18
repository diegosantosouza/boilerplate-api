import { z } from 'zod';
import { ExampleBackgroundJobSummary } from '../entities';

export const EnqueueRetryDemoJobInputSchema = z.object({
  message: z.string().min(1).default('Example retry demo background job'),
  failUntilAttempt: z.number().int().min(1).max(10).default(2),
});

export type EnqueueRetryDemoJobInput = z.infer<
  typeof EnqueueRetryDemoJobInputSchema
>;
export type EnqueueRetryDemoJobOutput = ExampleBackgroundJobSummary;
