import { z } from 'zod'

export const ItemIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
})

export type ItemIdInput = z.infer<typeof ItemIdSchema>
