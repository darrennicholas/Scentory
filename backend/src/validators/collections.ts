import { z } from 'zod';
import { imageUrlSchema, pageSchema, uuidSchema } from './common';

const text = z.string().trim();
export const collectionCreateSchema = z.object({
  name: text.min(2).max(80),
  description: text.max(500).nullable().optional().transform(value => value || null),
  coverImageUrl: imageUrlSchema,
  perfumeIds: z.array(uuidSchema).optional().default([]).refine(ids => new Set(ids).size === ids.length, 'Duplicate perfumes'),
});
export const collectionPatchSchema = collectionCreateSchema.omit({ perfumeIds: true }).partial();
export const collectionListQuerySchema = pageSchema;
export const membershipParamsSchema = z.object({ id: uuidSchema, perfumeId: uuidSchema });
export const membershipBodySchema = z.object({ perfumeId: uuidSchema });
