import { z } from 'zod'
import { Item } from '../entities';
import { PaginationSchema } from '@/shared/helpers';
import { PaginateResult } from 'mongoose';

export const ItemsListInputSchema = PaginationSchema.extend({
  name: z.string().optional(),
  active: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).optional(),
  category: z.string().optional(),
})

export type ItemsListInput = z.infer<typeof ItemsListInputSchema>
export type ItemsListOutput = PaginateResult<Item>;
