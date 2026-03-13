import { z } from 'zod'
import { Item } from '../entities';
import { ItemCreateInputSchema } from './item-create-dto';

export const ItemUpdateInputSchema = ItemCreateInputSchema.partial();

export type ItemUpdateInput = z.infer<typeof ItemUpdateInputSchema>;
export type ItemUpdateOutput = Item;
