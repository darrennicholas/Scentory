import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { collections } from './routes/collections';
import { insights } from './routes/insights';
import { journal } from './routes/journal';
import { library } from './routes/library';
import { errorHandler, notFound } from './middlewares/error-handler';

export const app = express();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = [frontendUrl, ...(frontendUrl === 'http://localhost:3000' ? ['http://127.0.0.1:3000'] : [])];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use('/storage/images', express.static(path.resolve(__dirname, '../../storage/public/images')));
app.get('/api/health', (_req, res) => res.json({ data: { status: 'ok' } }));
app.use('/api', library);
app.use('/api', collections);
app.use('/api', journal);
app.use('/api', insights);
app.use(notFound);
app.use(errorHandler);




