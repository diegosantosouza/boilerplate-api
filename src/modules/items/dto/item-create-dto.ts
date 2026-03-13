import { z } from 'zod';
import { Item } from '../entities';

export const ItemCreateInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  active: z.boolean().default(true),
  category: z.string().min(1),
});

export type ItemCreateInput = z.infer<typeof ItemCreateInputSchema>;
export type ItemCreateOutput = Item;
