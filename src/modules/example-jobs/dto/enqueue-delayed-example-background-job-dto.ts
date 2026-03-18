import { z } from 'zod';
import { ExampleBackgroundJobSummary } from '../entities';

export const EnqueueDelayedExampleBackgroundJobInputSchema = z.object({
  message: z.string().min(1).default('Example delayed background job'),
  delayMs: z.number().int().positive().default(10000),
});

export type EnqueueDelayedExampleBackgroundJobInput = z.infer<
  typeof EnqueueDelayedExampleBackgroundJobInputSchema
>;
export type EnqueueDelayedExampleBackgroundJobOutput =
  ExampleBackgroundJobSummary;
