import { z } from 'zod';
import { ExampleBackgroundJobSummary } from '../entities';

export const EnqueueExampleBackgroundJobInputSchema = z.object({
  message: z.string().min(1).default('Example immediate background job'),
});

export type EnqueueExampleBackgroundJobInput = z.infer<
  typeof EnqueueExampleBackgroundJobInputSchema
>;
export type EnqueueExampleBackgroundJobOutput = ExampleBackgroundJobSummary;
