import type { RequestHandler } from 'express';
import { asyncHandler } from '../lib/async-handler';
import * as service from '../services/collections.service';

export const getInsights: RequestHandler = asyncHandler(async (_req, res) => {
  res.json({ data: await service.getInsights() });
});
