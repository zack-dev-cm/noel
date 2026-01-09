import { Router } from 'express';
import type { StorageRepositories } from '@noetic/shared';
import { InterventionQueue } from '../interventions/store.js';

const router = Router();

function getQueue(req: any): InterventionQueue {
  if (!req.app.locals.interventionQueue) {
    req.app.locals.interventionQueue = new InterventionQueue();
  }
  return req.app.locals.interventionQueue as InterventionQueue;
}

router.post('/api/interventions', async (req, res) => {
  const { sessionId, userId, prompt } = req.body as {
    sessionId?: string;
    userId?: string;
    prompt?: string;
  };

  if (!sessionId || !userId || !prompt) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  const storage = req.app.locals.storage as StorageRepositories;
  if (process.env.ALLOW_INTERVENTIONS !== 'true') {
    const consumed = await storage.payments.consumeEntitlement(userId, 'intervention');
    if (!consumed) {
      return res.status(403).json({ ok: false, error: 'entitlement_required' });
    }
  }

  const queue = getQueue(req);
  const item = queue.add(sessionId, userId, prompt);
  return res.json({ ok: true, interventionId: item.id });
});

router.get('/api/interventions/next', (req, res) => {
  const sessionId = req.query.sessionId as string | undefined;
  if (!sessionId) {
    return res.status(400).json({ ok: false, error: 'missing_session_id' });
  }

  const queue = getQueue(req);
  const item = queue.next(sessionId);
  return res.json({ ok: true, intervention: item });
});

export default router;
