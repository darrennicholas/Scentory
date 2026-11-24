import type { RequestHandler } from 'express';
import { asyncHandler } from '../lib/async-handler';
import { paginationMeta } from '../validators/common';
import { perfumeSchema } from '../validators/library';
import { reviewListQuerySchema, reviewPatchSchema, reviewSchema, wishlistListQuerySchema, wishlistPatchSchema, wishlistSchema } from '../validators/journal';
import * as service from '../services/journal.service';

const id = (res: Parameters<RequestHandler>[1]) => (res.locals.validatedParams as { id: string }).id;
const notFound = (res: Parameters<RequestHandler>[1], name: string) => res.status(404).json({ error: { code: 'NOT_FOUND', message: `${name} not found` } });

export const listReviews: RequestHandler = asyncHandler(async (_req, res) => {
  const q = res.locals.validatedQuery as ReturnType<typeof reviewListQuerySchema.parse>;
  const result = await service.listReviews(q);
  res.json({ data: result.data, meta: paginationMeta(q.page, q.limit, result.total) });
});
export const getReview: RequestHandler = asyncHandler(async (_req, res) => {
  const data = await service.getReview(id(res));
  if (!data) { notFound(res, 'Review'); return; }
  res.json({ data });
});
export const createReview: RequestHandler = asyncHandler(async (req, res) => {
  res.status(201).json({ data: await service.createReview(req.body as ReturnType<typeof reviewSchema.parse>) });
});
export const updateReview: RequestHandler = asyncHandler(async (req, res) => {
  res.json({ data: await service.updateReview(id(res), req.body as ReturnType<typeof reviewPatchSchema.parse>) });
});
export const deleteReview: RequestHandler = asyncHandler(async (_req, res) => {
  await service.deleteReview(id(res));
  res.sendStatus(204);
});

export const listWishlist: RequestHandler = asyncHandler(async (_req, res) => {
  const q = res.locals.validatedQuery as ReturnType<typeof wishlistListQuerySchema.parse>;
  const result = await service.listWishlist(q);
  res.json({ data: result.data, meta: paginationMeta(q.page, q.limit, result.total) });
});
export const getWishlistItem: RequestHandler = asyncHandler(async (_req, res) => {
  const data = await service.getWishlistItem(id(res));
  if (!data) { notFound(res, 'Wishlist item'); return; }
  res.json({ data });
});
export const createWishlistItem: RequestHandler = asyncHandler(async (req, res) => {
  res.status(201).json({ data: await service.createWishlistItem(req.body as ReturnType<typeof wishlistSchema.parse>) });
});
export const updateWishlistItem: RequestHandler = asyncHandler(async (req, res) => {
  res.json({ data: await service.updateWishlistItem(id(res), req.body as ReturnType<typeof wishlistPatchSchema.parse>) });
});
export const deleteWishlistItem: RequestHandler = asyncHandler(async (_req, res) => {
  await service.deleteWishlistItem(id(res));
  res.sendStatus(204);
});
export const convertWishlistItem: RequestHandler = asyncHandler(async (req, res) => {
  res.status(201).json({ data: await service.convertWishlistItem(id(res), req.body as ReturnType<typeof perfumeSchema.parse>) });
});
