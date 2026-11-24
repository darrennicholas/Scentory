import { Router } from 'express';
import * as controller from '../controllers/library.controller';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate';
import { idParamsSchema } from '../validators/common';
import {
  noteListQuerySchema, notePatchSchema, noteSchema,
  perfumeListQuerySchema, perfumePatchSchema, perfumeSchema,
} from '../validators/library';

export const library = Router();

library.get('/fragrance-notes', validateQuery(noteListQuerySchema), controller.listNotes);
library.get('/fragrance-notes/:id', validateParams(idParamsSchema), controller.getNote);
library.post('/fragrance-notes', validateBody(noteSchema), controller.createNote);
library.patch('/fragrance-notes/:id', validateParams(idParamsSchema), validateBody(notePatchSchema), controller.updateNote);
library.delete('/fragrance-notes/:id', validateParams(idParamsSchema), controller.deleteNote);

library.get('/perfumes', validateQuery(perfumeListQuerySchema), controller.listPerfumes);
library.get('/perfumes/:id', validateParams(idParamsSchema), controller.getPerfume);
library.post('/perfumes', validateBody(perfumeSchema), controller.createPerfume);
library.patch('/perfumes/:id', validateParams(idParamsSchema), validateBody(perfumePatchSchema), controller.updatePerfume);
library.delete('/perfumes/:id', validateParams(idParamsSchema), controller.deletePerfume);
