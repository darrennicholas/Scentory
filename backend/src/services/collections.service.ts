import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { collectionCreateSchema, collectionListQuerySchema, collectionPatchSchema } from '../validators/collections';

type CollectionInput = ReturnType<typeof collectionCreateSchema.parse>;
type CollectionPatch = ReturnType<typeof collectionPatchSchema.parse>;
type CollectionQuery = ReturnType<typeof collectionListQuerySchema.parse>;
const key = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
const include = {
  perfumes: { include: { perfume: { include: { review: true } } } },
  _count: { select: { perfumes: true } },
} satisfies Prisma.CollectionInclude;

export async function listCollections(query: CollectionQuery) {
  const [data, total] = await Promise.all([
    prisma.collection.findMany({
      include, orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit, take: query.limit,
    }),
    prisma.collection.count(),
  ]);
  return { data, total };
}

export function getCollection(id: string) {
  return prisma.collection.findUnique({ where: { id }, include });
}

export function createCollection(input: CollectionInput) {
  const { perfumeIds, ...data } = input;
  return prisma.collection.create({
    data: { ...data, nameKey: key(input.name), perfumes: { create: perfumeIds.map(perfumeId => ({ perfumeId })) } },
    include,
  });
}

export function updateCollection(id: string, input: CollectionPatch) {
  return prisma.collection.update({
    where: { id },
    data: { ...input, ...(input.name ? { nameKey: key(input.name) } : {}) },
    include,
  });
}

export function deleteCollection(id: string) {
  return prisma.collection.delete({ where: { id } });
}

export function addPerfumes(collectionId: string, perfumeIds: string[]) {
  return prisma.collectionPerfume.createMany({ data: perfumeIds.map(perfumeId => ({ collectionId, perfumeId })) });
}

export function removePerfume(collectionId: string, perfumeId: string) {
  return prisma.collectionPerfume.delete({ where: { collectionId_perfumeId: { collectionId, perfumeId } } });
}

export async function getInsights() {
  const [totalPerfumes, totalCollections, totalReviews, totalWishlistItems, familyDistribution,
    concentrationDistribution, reviewStats, purchaseStats, wishlistStats, highPriorityWishlistCount, noteRows] = await Promise.all([
    prisma.perfume.count(),
    prisma.collection.count(),
    prisma.review.count(),
    prisma.wishlistItem.count(),
    prisma.perfume.groupBy({ by: ['fragranceFamily'], _count: { _all: true } }),
    prisma.perfume.groupBy({ by: ['concentration'], _count: { _all: true } }),
    prisma.review.aggregate({ _avg: { overallRating: true } }),
    prisma.perfume.aggregate({ _sum: { purchasePrice: true } }),
    prisma.wishlistItem.aggregate({ _sum: { estimatedPrice: true } }),
    prisma.wishlistItem.count({ where: { priority: 'HIGH' } }),
    prisma.perfumeNote.findMany({ distinct: ['perfumeId', 'noteId'], select: { noteId: true, note: { select: { name: true } } } }),
  ]);
  const notes = new Map<string, { id: string; name: string; count: number }>();
  for (const row of noteRows) {
    const existing = notes.get(row.noteId);
    if (existing) existing.count++;
    else notes.set(row.noteId, { id: row.noteId, name: row.note.name, count: 1 });
  }
  return {
    totalPerfumes, totalCollections, totalReviews, totalWishlistItems, familyDistribution, concentrationDistribution,
    topNotes: [...notes.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    averageRating: reviewStats._avg.overallRating,
    totalPurchaseSpending: (purchaseStats._sum.purchasePrice ?? new Prisma.Decimal(0)).toString(),
    wishlistEstimatedTotal: (wishlistStats._sum.estimatedPrice ?? new Prisma.Decimal(0)).toString(),
    highPriorityWishlistCount,
  };
}
