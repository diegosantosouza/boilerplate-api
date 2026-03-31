import { z } from 'zod';
import type { ExampleBackgroundJobSummary } from '../entities';
import '@/shared/config/zod-openapi-setup';

export const EnqueueExampleBackgroundJobInputSchema = z
  .object({
    message: z.string().min(1).default('Example immediate background job'),
  })
  .openapi('EnqueueExampleBackgroundJobInput');

export type EnqueueExampleBackgroundJobInput = z.infer<
  typeof EnqueueExampleBackgroundJobInputSchema
>;
export type EnqueueExampleBackgroundJobOutput = ExampleBackgroundJobSummary;
