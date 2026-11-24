import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { noteListQuerySchema, notePatchSchema, noteSchema, perfumeListQuerySchema, perfumePatchSchema, perfumeSchema } from '../validators/library';

type NoteInput = ReturnType<typeof noteSchema.parse>;
type NotePatch = ReturnType<typeof notePatchSchema.parse>;
type PerfumeInput = ReturnType<typeof perfumeSchema.parse>;
type PerfumePatch = ReturnType<typeof perfumePatchSchema.parse>;
type NoteQuery = ReturnType<typeof noteListQuerySchema.parse>;
type PerfumeQuery = ReturnType<typeof perfumeListQuerySchema.parse>;

const key = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
const perfumeInclude = {
  notes: { include: { note: true } },
  collections: { include: { collection: true } },
  review: true,
} satisfies Prisma.PerfumeInclude;

export async function listNotes(query: NoteQuery) {
  const where: Prisma.FragranceNoteWhereInput = {
    ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    ...(query.category ? { category: query.category } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.fragranceNote.findMany({
      where,
      include: {
        _count: { select: { perfumes: true } },
        perfumes: { select: { perfumeId: true, perfume: { select: { id: true, name: true, brand: true } } } },
      },
      orderBy: { name: 'asc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.fragranceNote.count({ where }),
  ]);
  return { data, total };
}

export function getNote(id: string) {
  return prisma.fragranceNote.findUnique({ where: { id }, include: { perfumes: { include: { perfume: true } } } });
}

export function createNote(input: NoteInput) {
  return prisma.fragranceNote.create({ data: { ...input, nameKey: key(input.name) } });
}

export function updateNote(id: string, input: NotePatch) {
  return prisma.fragranceNote.update({
    where: { id },
    data: { ...input, ...(input.name ? { nameKey: key(input.name) } : {}) },
  });
}

export async function deleteNote(id: string) {
  if (await prisma.perfumeNote.count({ where: { noteId: id } })) return false;
  await prisma.fragranceNote.delete({ where: { id } });
  return true;
}

export async function listPerfumes(query: PerfumeQuery) {
  const where: Prisma.PerfumeWhereInput = {
    ...(query.search ? { OR: [
      { name: { contains: query.search, mode: 'insensitive' } },
      { brand: { contains: query.search, mode: 'insensitive' } },
    ] } : {}),
    ...(query.concentration ? { concentration: query.concentration } : {}),
    ...(query.fragranceFamily ? { fragranceFamily: query.fragranceFamily } : {}),
  };
  const orderBy: Prisma.PerfumeOrderByWithRelationInput = query.sort === 'oldest' ? { createdAt: 'asc' }
    : query.sort === 'name_asc' ? { name: 'asc' }
      : query.sort === 'name_desc' ? { name: 'desc' }
        : query.sort === 'brand_asc' ? { brand: 'asc' }
          : { createdAt: 'desc' };
  const [data, total] = await Promise.all([
    prisma.perfume.findMany({
      where, include: perfumeInclude, orderBy,
      skip: (query.page - 1) * query.limit, take: query.limit,
    }),
    prisma.perfume.count({ where }),
  ]);
  return { data, total };
}

export function getPerfume(id: string) {
  return prisma.perfume.findUnique({ where: { id }, include: perfumeInclude });
}

export function createPerfume(input: PerfumeInput) {
  const { notes, ...data } = input;
  return prisma.perfume.create({ data: { ...data, notes: { create: notes } }, include: perfumeInclude });
}

export function updatePerfume(id: string, input: PerfumePatch) {
  const { notes, ...data } = input;
  return prisma.perfume.update({
    where: { id },
    data: { ...data, ...(notes !== undefined ? { notes: { deleteMany: {}, create: notes } } : {}) },
    include: perfumeInclude,
  });
}

export function deletePerfume(id: string) {
  return prisma.perfume.delete({ where: { id } });
}
