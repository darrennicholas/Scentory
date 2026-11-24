import type { RequestHandler } from 'express';
import { asyncHandler } from '../lib/async-handler';
import { paginationMeta } from '../validators/common';
import { noteListQuerySchema, notePatchSchema, noteSchema, perfumeListQuerySchema, perfumePatchSchema, perfumeSchema } from '../validators/library';
import * as service from '../services/library.service';

const query = <T>(res: Parameters<RequestHandler>[1], key: string) => res.locals[key] as T;
const params = (res: Parameters<RequestHandler>[1]) => res.locals.validatedParams as { id: string };

export const listNotes: RequestHandler = asyncHandler(async (_req, res) => {
  const q = query<ReturnType<typeof noteListQuerySchema.parse>>(res, 'validatedQuery');
  const result = await service.listNotes(q);
  res.json({ data: result.data, meta: paginationMeta(q.page, q.limit, result.total) });
});
export const getNote: RequestHandler = asyncHandler(async (_req, res) => {
  const note = await service.getNote(params(res).id);
  if (!note) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } }); return; }
  res.json({ data: note });
});
export const createNote: RequestHandler = asyncHandler(async (req, res) => {
  res.status(201).json({ data: await service.createNote(req.body as ReturnType<typeof noteSchema.parse>) });
});
export const updateNote: RequestHandler = asyncHandler(async (req, res) => {
  res.json({ data: await service.updateNote(params(res).id, req.body as ReturnType<typeof notePatchSchema.parse>) });
});
export const deleteNote: RequestHandler = asyncHandler(async (_req, res) => {
  const deleted = await service.deleteNote(params(res).id);
  if (!deleted) { res.status(409).json({ error: { code: 'CONFLICT', message: 'This note is used by a fragrance. Remove it from the fragrance first.' } }); return; }
  res.sendStatus(204);
});

export const listPerfumes: RequestHandler = asyncHandler(async (_req, res) => {
  const q = query<ReturnType<typeof perfumeListQuerySchema.parse>>(res, 'validatedQuery');
  const result = await service.listPerfumes(q);
  res.json({ data: result.data, meta: paginationMeta(q.page, q.limit, result.total) });
});
export const getPerfume: RequestHandler = asyncHandler(async (_req, res) => {
  const perfume = await service.getPerfume(params(res).id);
  if (!perfume) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Perfume not found' } }); return; }
  res.json({ data: perfume });
});
export const createPerfume: RequestHandler = asyncHandler(async (req, res) => {
  res.status(201).json({ data: await service.createPerfume(req.body as ReturnType<typeof perfumeSchema.parse>) });
});
export const updatePerfume: RequestHandler = asyncHandler(async (req, res) => {
  res.json({ data: await service.updatePerfume(params(res).id, req.body as ReturnType<typeof perfumePatchSchema.parse>) });
});
export const deletePerfume: RequestHandler = asyncHandler(async (_req, res) => {
  await service.deletePerfume(params(res).id);
  res.sendStatus(204);
});
