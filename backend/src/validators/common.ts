import { z } from 'zod';
import { NoteCategory } from '@prisma/client';

export const uuidSchema = z.string().uuid();
export const idParamsSchema = z.object({ id: uuidSchema });
export const pageSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});
export const optionalText = (max: number) => z.string().trim().max(max).nullable().optional().transform(value => value || null);
const externalImageUrl = z.string().trim().url().max(2048)
  .refine(value => new URL(value).protocol === 'https:', 'Image URL must use HTTPS');
const localImagePath = z.string().regex(/^\/storage\/images\/[a-z0-9][a-z0-9._-]{0,126}$/i, 'Invalid local image path');
export const imageUrlSchema = z.union([externalImageUrl, localImagePath])
  .nullable().optional().or(z.literal('').transform(() => null));
export const moneySchema = z.string().regex(/^\d{1,12}(\.\d{1,2})?$/)
  .nullable().optional().or(z.literal('').transform(() => null));
export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf())
    && date.toISOString().slice(0, 10) === value
    && value <= new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
}, 'Invalid date or date is in the future').nullable().optional()
  .or(z.literal('').transform(() => null))
  .transform(value => value ? new Date(`${value}T00:00:00.000Z`) : null);

export const noteCategorySchema = z.nativeEnum(NoteCategory);

export function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
