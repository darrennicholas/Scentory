import { Router } from 'express';
import * as controller from '../controllers/journal.controller';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate';
import { idParamsSchema } from '../validators/common';
import { perfumeSchema } from '../validators/library';
import {
  reviewListQuerySchema, reviewPatchSchema, reviewSchema,
  wishlistListQuerySchema, wishlistPatchSchema, wishlistSchema,
} from '../validators/journal';

export const journal = Router();

journal.get('/reviews', validateQuery(reviewListQuerySchema), controller.listReviews);
journal.get('/reviews/:id', validateParams(idParamsSchema), controller.getReview);
journal.post('/reviews', validateBody(reviewSchema), controller.createReview);
journal.patch('/reviews/:id', validateParams(idParamsSchema), validateBody(reviewPatchSchema), controller.updateReview);
journal.delete('/reviews/:id', validateParams(idParamsSchema), controller.deleteReview);

journal.get('/wishlist', validateQuery(wishlistListQuerySchema), controller.listWishlist);
journal.get('/wishlist/:id', validateParams(idParamsSchema), controller.getWishlistItem);
journal.post('/wishlist', validateBody(wishlistSchema), controller.createWishlistItem);
journal.patch('/wishlist/:id', validateParams(idParamsSchema), validateBody(wishlistPatchSchema), controller.updateWishlistItem);
journal.delete('/wishlist/:id', validateParams(idParamsSchema), controller.deleteWishlistItem);
journal.post('/wishlist/:id/convert', validateParams(idParamsSchema), validateBody(perfumeSchema), controller.convertWishlistItem);
