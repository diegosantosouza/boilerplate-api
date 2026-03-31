import { z } from 'zod';
import '@/shared/config/zod-openapi-setup';

export const ItemOutputSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    active: z.boolean(),
    category: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('Item');

export const ItemListResponseSchema = z
  .object({
    items: z.array(ItemOutputSchema),
    limit: z.number().int(),
    page: z.number().int(),
    totalItems: z.number().int(),
    totalPages: z.number().int(),
    nextPage: z.number().int().nullable(),
    prevPage: z.number().int().nullable(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
  })
  .openapi('ItemListResponse');
