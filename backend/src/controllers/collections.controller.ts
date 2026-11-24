import type { RequestHandler } from 'express';
import { asyncHandler } from '../lib/async-handler';
import { paginationMeta } from '../validators/common';
import { collectionCreateSchema, collectionListQuerySchema, collectionPatchSchema, membershipBodySchema } from '../validators/collections';
import * as service from '../services/collections.service';

const query = (res: Parameters<RequestHandler>[1]) => res.locals.validatedQuery as ReturnType<typeof collectionListQuerySchema.parse>;
const id = (res: Parameters<RequestHandler>[1]) => (res.locals.validatedParams as { id: string }).id;
const membership = (res: Parameters<RequestHandler>[1]) => res.locals.validatedParams as { id: string; perfumeId: string };
const notFound = (res: Parameters<RequestHandler>[1]) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Collection not found' } });

export const listCollections: RequestHandler = asyncHandler(async (_req, res) => {
  const q = query(res);
  const result = await service.listCollections(q);
  res.json({ data: result.data, meta: paginationMeta(q.page, q.limit, result.total) });
});
export const getCollection: RequestHandler = asyncHandler(async (_req, res) => {
  const collection = await service.getCollection(id(res));
  if (!collection) { notFound(res); return; }
  res.json({ data: collection });
});
export const createCollection: RequestHandler = asyncHandler(async (req, res) => {
  res.status(201).json({ data: await service.createCollection(req.body as ReturnType<typeof collectionCreateSchema.parse>) });
});
export const updateCollection: RequestHandler = asyncHandler(async (req, res) => {
  res.json({ data: await service.updateCollection(id(res), req.body as ReturnType<typeof collectionPatchSchema.parse>) });
});
export const deleteCollection: RequestHandler = asyncHandler(async (_req, res) => {
  await service.deleteCollection(id(res));
  res.sendStatus(204);
});
export const addPerfume: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as ReturnType<typeof membershipBodySchema.parse>;
  res.status(201).json({ data: await service.addPerfumes(id(res), body.perfumeIds) });
});
export const removePerfume: RequestHandler = asyncHandler(async (_req, res) => {
  const values = membership(res);
  await service.removePerfume(values.id, values.perfumeId);
  res.sendStatus(204);
});
