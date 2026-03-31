import { z } from 'zod';
import '@/shared/config/zod-openapi-setup';

export const ItemIdSchema = z
  .object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
  })
  .openapi('ItemId');

export type ItemIdInput = z.infer<typeof ItemIdSchema>;
