import type { PaginateResult } from 'mongoose';
import { z } from 'zod';
import { PaginationSchema } from '@/shared/helpers';
import type { Item } from '../entities';
import '@/shared/config/zod-openapi-setup';

export const ItemsListInputSchema = PaginationSchema.extend({
  name: z.string().optional(),
  active: z
    .union([z.boolean(), z.string().transform(val => val === 'true')])
    .optional(),
  category: z.string().optional(),
}).openapi('ItemsListInput');

export type ItemsListInput = z.infer<typeof ItemsListInputSchema>;
export type ItemsListOutput = PaginateResult<Item>;
