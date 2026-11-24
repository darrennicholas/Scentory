import { Router } from 'express';
import * as controller from '../controllers/collections.controller';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate';
import { idParamsSchema } from '../validators/common';
import {
  collectionCreateSchema, collectionListQuerySchema, collectionPatchSchema,
  membershipBodySchema, membershipParamsSchema,
} from '../validators/collections';

export const collections = Router();

collections.get('/collections', validateQuery(collectionListQuerySchema), controller.listCollections);
collections.get('/collections/:id', validateParams(idParamsSchema), controller.getCollection);
collections.post('/collections', validateBody(collectionCreateSchema), controller.createCollection);
collections.patch('/collections/:id', validateParams(idParamsSchema), validateBody(collectionPatchSchema), controller.updateCollection);
collections.delete('/collections/:id', validateParams(idParamsSchema), controller.deleteCollection);
collections.post('/collections/:id/perfumes', validateParams(idParamsSchema), validateBody(membershipBodySchema), controller.addPerfume);
collections.delete('/collections/:id/perfumes/:perfumeId', validateParams(membershipParamsSchema), controller.removePerfume);
