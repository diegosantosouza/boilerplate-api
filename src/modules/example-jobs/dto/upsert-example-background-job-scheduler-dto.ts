import { z } from 'zod';
import '@/shared/config/zod-openapi-setup';

export const UpsertExampleBackgroundJobSchedulerInputSchema = z
  .object({
    schedulerId: z.string().min(1).optional(),
    message: z.string().min(1).optional(),
    everyMs: z.number().int().positive().optional(),
  })
  .openapi('UpsertExampleBackgroundJobSchedulerInput');

export const ExampleBackgroundJobSchedulerIdSchema = z
  .object({
    schedulerId: z.string().min(1),
  })
  .openapi('ExampleBackgroundJobSchedulerId');

export type UpsertExampleBackgroundJobSchedulerInput = z.infer<
  typeof UpsertExampleBackgroundJobSchedulerInputSchema
>;

export type RemoveExampleBackgroundJobSchedulerInput = z.infer<
  typeof ExampleBackgroundJobSchedulerIdSchema
>;
