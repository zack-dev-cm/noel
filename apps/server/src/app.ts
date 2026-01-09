import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import interventionsRouter from './routes/interventions.js';
import paymentsRouter from './routes/payments.js';
import streamRouter from './routes/stream.js';
import telegramWebhookRouter from './routes/telegramWebhook.js';
import { createRepositories } from './storage/db.js';
import { applyMigrations } from './storage/migrate.js';
import { startRetentionJob } from './storage/retention.js';

export function createApp() {
  const app = express();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const webDist = path.resolve(__dirname, '..', '..', 'web', 'dist');

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.use(express.static(webDist));

  app.locals.storage = createRepositories();
  void applyMigrations();
  startRetentionJob();

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/meta', (_req, res) => {
    res.json({
      name: 'Noetic Mirror',
      status: 'stub',
      timestamp: new Date().toISOString()
    });
  });

  app.use(authRouter);
  app.use(adminRouter);
  app.use(interventionsRouter);
  app.use(paymentsRouter);
  app.use(streamRouter);
  app.use(telegramWebhookRouter);

  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDist, 'index.html'));
  });

  return app;
}
