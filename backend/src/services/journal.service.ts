import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { perfumeSchema } from '../validators/library';
import { reviewListQuerySchema, reviewPatchSchema, reviewSchema, wishlistListQuerySchema, wishlistPatchSchema, wishlistSchema } from '../validators/journal';

type ReviewQuery = ReturnType<typeof reviewListQuerySchema.parse>;
type ReviewInput = ReturnType<typeof reviewSchema.parse>;
type ReviewPatch = ReturnType<typeof reviewPatchSchema.parse>;
type WishlistQuery = ReturnType<typeof wishlistListQuerySchema.parse>;
type WishlistInput = ReturnType<typeof wishlistSchema.parse>;
type WishlistPatch = ReturnType<typeof wishlistPatchSchema.parse>;
type PerfumeInput = ReturnType<typeof perfumeSchema.parse>;

export async function listReviews(query: ReviewQuery) {
  const where: Prisma.ReviewWhereInput = {
    ...(query.overallRating ? { overallRating: query.overallRating } : {}),
    perfume: {
      ...(query.brand ? { brand: { contains: query.brand, mode: 'insensitive' } } : {}),
      ...(query.fragranceFamily ? { fragranceFamily: query.fragranceFamily } : {}),
    },
  };
  const orderBy: Prisma.ReviewOrderByWithRelationInput = query.sort === 'oldest' ? { createdAt: 'asc' }
    : query.sort === 'highest' ? { overallRating: 'desc' }
      : query.sort === 'lowest' ? { overallRating: 'asc' }
        : { createdAt: 'desc' };
  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where, include: { perfume: true }, orderBy,
      skip: (query.page - 1) * query.limit, take: query.limit,
    }),
    prisma.review.count({ where }),
  ]);
  return { data, total };
}

export function getReview(id: string) {
  return prisma.review.findUnique({ where: { id }, include: { perfume: true } });
}

export function createReview(input: ReviewInput) {
  return prisma.review.create({ data: input, include: { perfume: true } });
}

export function updateReview(id: string, input: ReviewPatch) {
  return prisma.review.update({ where: { id }, data: input, include: { perfume: true } });
}

export function deleteReview(id: string) {
  return prisma.review.delete({ where: { id } });
}

export async function listWishlist(query: WishlistQuery) {
  const where: Prisma.WishlistItemWhereInput = {
    ...(query.search ? { OR: [
      { name: { contains: query.search, mode: 'insensitive' } },
      { brand: { contains: query.search, mode: 'insensitive' } },
    ] } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
  };
  const orderBy: Prisma.WishlistItemOrderByWithRelationInput = query.sort === 'oldest' ? { createdAt: 'asc' }
    : query.sort === 'name_asc' ? { name: 'asc' }
      : query.sort === 'name_desc' ? { name: 'desc' }
        : query.sort === 'priority' ? { priority: 'desc' }
          : { createdAt: 'desc' };
  const [data, total] = await Promise.all([
    prisma.wishlistItem.findMany({
      where, orderBy, skip: (query.page - 1) * query.limit, take: query.limit,
    }),
    prisma.wishlistItem.count({ where }),
  ]);
  return { data, total };
}

export function getWishlistItem(id: string) {
  return prisma.wishlistItem.findUnique({ where: { id } });
}

export function createWishlistItem(input: WishlistInput) {
  return prisma.wishlistItem.create({ data: input });
}

export function updateWishlistItem(id: string, input: WishlistPatch) {
  return prisma.wishlistItem.update({ where: { id }, data: input });
}

export function deleteWishlistItem(id: string) {
  return prisma.wishlistItem.delete({ where: { id } });
}

export function convertWishlistItem(id: string, input: PerfumeInput) {
  const { notes, ...data } = input;
  return prisma.$transaction(async transaction => {
    await transaction.wishlistItem.delete({ where: { id } });
    return transaction.perfume.create({
      data: { ...data, notes: { create: notes } },
      include: { notes: { include: { note: true } }, review: true, collections: { include: { collection: true } } },
    });
  });
}
