import { z } from 'zod';
import { Concentration, FragranceFamily, NoteLayer } from '@prisma/client';
import { dateOnlySchema, imageUrlSchema, moneySchema, noteCategorySchema, optionalText, pageSchema, uuidSchema } from './common';

const text = (min: number, max: number) => z.string().trim().min(min).max(max);

export const noteSchema = z.object({
  name: text(2, 80),
  category: noteCategorySchema,
  description: optionalText(500),
});
export const notePatchSchema = noteSchema.partial();

const perfumeFieldsSchema = z.object({
  name: text(2, 120),
  brand: text(2, 100),
  concentration: z.nativeEnum(Concentration),
  fragranceFamily: z.nativeEnum(FragranceFamily),
  volumeMl: z.number().int().min(1).max(1000).nullable().optional(),
  description: optionalText(2000),
  imageUrl: imageUrlSchema,
  purchasePrice: moneySchema,
  purchaseDate: dateOnlySchema,
  notes: z.array(z.object({ noteId: uuidSchema, layer: z.nativeEnum(NoteLayer) })).optional().default([]),
});
const uniqueNotes = (notes: { noteId: string; layer: string }[]) => new Set(notes.map(note => `${note.noteId}:${note.layer}`)).size === notes.length;
export const perfumeSchema = perfumeFieldsSchema.refine(value => uniqueNotes(value.notes), {
  path: ['notes'], message: 'Duplicate note in the same layer',
});
export const perfumePatchSchema = perfumeFieldsSchema.partial().refine(value => !value.notes || uniqueNotes(value.notes), {
  path: ['notes'], message: 'Duplicate note in the same layer',
});

export const noteListQuerySchema = pageSchema.extend({
  search: z.string().trim().max(120).optional(),
  category: noteCategorySchema.optional(),
});
export const perfumeListQuerySchema = pageSchema.extend({
  search: z.string().trim().max(120).optional(),
  concentration: z.nativeEnum(Concentration).optional(),
  fragranceFamily: z.nativeEnum(FragranceFamily).optional(),
  sort: z.enum(['newest', 'oldest', 'name_asc', 'name_desc', 'brand_asc']).default('newest'),
});
