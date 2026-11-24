import { Router } from 'express';
import { getInsights } from '../controllers/insights.controller';

export const insights = Router();
insights.get('/insights', getInsights);
