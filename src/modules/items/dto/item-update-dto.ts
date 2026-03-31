import type { z } from 'zod';
import type { Item } from '../entities';
import { ItemCreateInputSchema } from './item-create-dto';

export const ItemUpdateInputSchema =
  ItemCreateInputSchema.partial().openapi('ItemUpdateInput');

export type ItemUpdateInput = z.infer<typeof ItemUpdateInputSchema>;
export type ItemUpdateOutput = Item;
