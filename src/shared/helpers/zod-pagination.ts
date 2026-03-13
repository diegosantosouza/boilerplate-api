import z from "zod";

export const PaginationSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
})

export type PaginationInput = z.infer<typeof PaginationSchema>

export const arrayFromQueryString = z.preprocess((val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return [val];
  if (typeof val === 'object' && val !== null) {
    return Object.values(val);
  }
  return undefined;
}, z.array(z.string()).optional())
