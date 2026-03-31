import { z } from 'zod';
import type { ExampleBackgroundJobSummary } from '../entities';
import '@/shared/config/zod-openapi-setup';

export const EnqueueRetryDemoJobInputSchema = z
  .object({
    message: z.string().min(1).default('Example retry demo background job'),
    failUntilAttempt: z.number().int().min(1).max(10).default(2),
  })
  .openapi('EnqueueRetryDemoJobInput');

export type EnqueueRetryDemoJobInput = z.infer<
  typeof EnqueueRetryDemoJobInputSchema
>;
export type EnqueueRetryDemoJobOutput = ExampleBackgroundJobSummary;
