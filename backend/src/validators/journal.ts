import { z } from 'zod';
import { Concentration, FragranceFamily, Priority } from '@prisma/client';
import { dateOnlySchema, imageUrlSchema, moneySchema, pageSchema, optionalText, uuidSchema } from './common';

const ratingSchema = z.number().int().min(1).max(5);
export const reviewSchema = z.object({
  perfumeId: uuidSchema,
  overallRating: ratingSchema,
  longevityRating: ratingSchema.nullable().optional(),
  projectionRating: ratingSchema.nullable().optional(),
  reviewText: optionalText(2000),
  testedDate: dateOnlySchema,
});
export const reviewPatchSchema = reviewSchema.partial();
export const reviewListQuerySchema = pageSchema.extend({
  overallRating: z.coerce.number().int().min(1).max(5).optional(),
  brand: z.string().trim().max(100).optional(),
  fragranceFamily: z.nativeEnum(FragranceFamily).optional(),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest']).default('newest'),
});

export const wishlistSchema = z.object({
  name: z.string().trim().min(2).max(120),
  brand: z.string().trim().min(2).max(100),
  concentration: z.nativeEnum(Concentration),
  fragranceFamily: z.nativeEnum(FragranceFamily).nullable().optional(),
  imageUrl: imageUrlSchema,
  estimatedPrice: moneySchema,
  priority: z.nativeEnum(Priority).default('MEDIUM'),
  notes: optionalText(1000),
});
export const wishlistPatchSchema = wishlistSchema.partial();
export const wishlistListQuerySchema = pageSchema.extend({
  search: z.string().trim().max(120).optional(),
  priority: z.nativeEnum(Priority).optional(),
  sort: z.enum(['newest', 'oldest', 'name_asc', 'name_desc', 'priority']).default('newest'),
});
