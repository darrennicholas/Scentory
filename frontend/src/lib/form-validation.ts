import { z } from 'zod';
import { categories, concentrations, families } from './models';

const values = (allowed: readonly string[]) => z.string().trim().refine(value => allowed.includes(value), 'Choose a valid option');
const optionalValues = (allowed: readonly string[]) => z.string().trim().refine(value => !value || allowed.includes(value), 'Choose a valid option').transform(value => value || null);
const text = (min: number, max: number) => z.string().trim().min(min, `Enter at least ${min} characters`).max(max, `Use at most ${max} characters`);
const optionalText = (max: number) => z.string().trim().max(max, `Use at most ${max} characters`).transform(value => value || null);
const imageUrl = z.string().trim().max(2048, 'Image address must be 2048 characters or fewer').refine(value => {
  if (!value) return true;
  if (/^\/storage\/images\/[a-z0-9][a-z0-9._-]{0,126}$/i.test(value)) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}, 'Use a valid HTTPS image URL or a local /storage/images/ path').transform(value => value || null);
const money = z.string().trim().refine(value => !value || /^\d{1,12}(\.\d{1,2})?$/.test(value), 'Enter a non-negative amount with up to two decimal places').transform(value => value || null);
const date = z.string().trim().refine(value => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
    && value <= new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
}, 'Enter a valid date that is not in the future').transform(value => value || null);
const volume = z.string().trim().refine(value => !value || /^(?:[1-9]\d{0,2}|1000)$/.test(value), 'Volume must be a whole number from 1 to 1000 ml').transform(value => value ? Number(value) : null);
const noteLinks = z.array(z.object({ noteId: z.string().uuid(), layer: z.enum(['TOP', 'MIDDLE', 'BASE']) }))
  .refine(notes => new Set(notes.map(note => `${note.noteId}:${note.layer}`)).size === notes.length, 'A note can only appear once in the same layer');

export const perfumeFormSchema = z.object({
  name: text(2, 120), brand: text(2, 100), concentration: values(concentrations), fragranceFamily: values(families),
  volumeMl: volume, description: optionalText(2000), imageUrl, purchasePrice: money, purchaseDate: date, notes: noteLinks,
});
export const wishlistFormSchema = z.object({
  name: text(2, 120), brand: text(2, 100), concentration: values(concentrations), fragranceFamily: optionalValues(families),
  imageUrl, estimatedPrice: money, priority: values(['HIGH', 'MEDIUM', 'LOW']), notes: optionalText(1000),
});
export const collectionFormSchema = z.object({
  name: text(2, 80), description: optionalText(500), coverImageUrl: imageUrl,
  perfumeIds: z.array(z.string().uuid()).max(100).refine(ids => new Set(ids).size === ids.length, 'A fragrance can only be selected once'),
});
export const noteFormSchema = z.object({ name: text(2, 80), category: values(categories), description: optionalText(500) });
export const reviewFormSchema = z.object({
  perfumeId: z.string().uuid(),
  overallRating: z.number().int().min(1).max(5, 'Rating must be from 1 to 5'),
  longevityRating: z.number().int().min(1).max(5).nullable(),
  projectionRating: z.number().int().min(1).max(5).nullable(),
  reviewText: optionalText(2000), testedDate: date,
});

export function clientFieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = issue.path.join('.') || '_form';
    (errors[field] ??= []).push(issue.message);
    return errors;
  }, {});
}
