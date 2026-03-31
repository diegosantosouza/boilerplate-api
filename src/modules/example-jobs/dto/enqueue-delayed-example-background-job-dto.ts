import { z } from 'zod';
import type { ExampleBackgroundJobSummary } from '../entities';
import '@/shared/config/zod-openapi-setup';

export const EnqueueDelayedExampleBackgroundJobInputSchema = z
  .object({
    message: z.string().min(1).default('Example delayed background job'),
    delayMs: z.number().int().positive().default(10000),
  })
  .openapi('EnqueueDelayedExampleBackgroundJobInput');

export type EnqueueDelayedExampleBackgroundJobInput = z.infer<
  typeof EnqueueDelayedExampleBackgroundJobInputSchema
>;
export type EnqueueDelayedExampleBackgroundJobOutput =
  ExampleBackgroundJobSummary;
