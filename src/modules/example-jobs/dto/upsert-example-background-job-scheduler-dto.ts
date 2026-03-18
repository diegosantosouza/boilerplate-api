import { z } from 'zod';

export const UpsertExampleBackgroundJobSchedulerInputSchema = z.object({
  schedulerId: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  everyMs: z.number().int().positive().optional(),
});

export const ExampleBackgroundJobSchedulerIdSchema = z.object({
  schedulerId: z.string().min(1),
});

export type UpsertExampleBackgroundJobSchedulerInput = z.infer<
  typeof UpsertExampleBackgroundJobSchedulerInputSchema
>;

export type RemoveExampleBackgroundJobSchedulerInput = z.infer<
  typeof ExampleBackgroundJobSchedulerIdSchema
>;
