import { Router } from 'express';
import type { StreamEvent } from '@noetic/shared';
import type { StreamService } from '../stream/streamService.js';
import { logEvent } from '../observability/logger.js';

const router = Router();

router.post('/api/stream/publish', async (req, res) => {
  const token = process.env.STREAM_PUBLISH_TOKEN;
  if (token && req.headers['x-stream-token'] !== token) {
    return res.status(403).json({ ok: false });
  }

  const { sessionId, event } = req.body as { sessionId?: string; event?: StreamEvent };
  if (!sessionId || !event) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  if (!event.content || event.content.trim().length === 0) {
    logEvent('stream_empty_content', { session_id: sessionId, role: event.role }, 'warn');
  }

  const streamService = req.app.locals.streamService as StreamService;
  await streamService.publish(sessionId, {
    role: event.role,
    content: event.content,
    ts: event.ts,
    telemetry: event.telemetry
  });

  return res.json({ ok: true });
});

export default router;
