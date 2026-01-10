import { randomUUID } from 'crypto';
import { Router } from 'express';
import type { SessionRecord, StorageRepositories, StreamEvent } from '@noetic/shared';
import type { StreamService } from '../stream/streamService.js';
import { postChannelStreamUpdate } from '../bot/channel.js';
import { logEvent } from '../observability/logger.js';

const router = Router();
const PUBLIC_SESSION_UUID = process.env.PUBLIC_SESSION_UUID || '00000000-0000-0000-0000-000000000000';

function resolveSessionId(sessionId: string): string {
  return sessionId === 'public' ? PUBLIC_SESSION_UUID : sessionId;
}

async function ensureSession(storage: StorageRepositories, sessionId: string, isPublicSession: boolean) {
  const existing = await storage.sessions.getSession(sessionId);
  if (existing) {
    return existing;
  }
  const now = new Date().toISOString();
  const defaultLanguage = process.env.DEFAULT_SESSION_LANGUAGE === 'ru' ? 'ru' : 'en';
  const record: SessionRecord = {
    id: sessionId,
    user_id: null,
    type: isPublicSession ? 'public' : 'private',
    status: 'running',
    researcher_model: process.env.OPENAI_RESEARCHER_MODEL || 'gpt-5.2-2025-12-11',
    subject_model: process.env.GEMINI_MODEL || 'gemini-3-pro-preview',
    session_language: defaultLanguage,
    created_at: now,
    started_at: now,
    ended_at: null
  };
  return storage.sessions.createSession(record);
}

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
  const storageSessionId = resolveSessionId(sessionId);
  const isPublicSession = sessionId === 'public';
  const published = await streamService.publish(sessionId, {
    role: event.role,
    content: event.content,
    ts: event.ts,
    model: event.model,
    model_tag: event.model_tag,
    telemetry: event.telemetry
  });
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken) {
    void postChannelStreamUpdate(botToken, sessionId, published);
  }
  const storage = req.app.locals.storage as StorageRepositories;
  try {
    await ensureSession(storage, storageSessionId, isPublicSession);
    await storage.transcripts.appendMessage({
      id: randomUUID(),
      session_id: storageSessionId,
      seq: published.seq,
      role: published.role,
      content: published.content,
      token_count: null,
      created_at: published.ts || new Date().toISOString()
    });
    if (event.telemetry) {
      await storage.telemetry.appendTelemetry({
        id: randomUUID(),
        session_id: storageSessionId,
        seq: published.seq,
        distress_score: event.telemetry.distress_score,
        self_ref_rate: event.telemetry.self_ref_rate,
        uncertainty: event.telemetry.uncertainty,
        latency_ms: event.telemetry.latency_ms,
        breath_bpm: event.telemetry.breath?.bpm ?? null,
        breath_variability: event.telemetry.breath?.variability ?? null,
        breath_coherence: event.telemetry.breath?.coherence ?? null,
        breath_phase: event.telemetry.breath?.phase ?? null,
        breath_source: event.telemetry.breath?.source ?? null,
        created_at: published.ts || new Date().toISOString()
      });
    }
  } catch (error) {
    logEvent('stream_persist_failed', { session_id: sessionId, error: String(error) }, 'error');
  }

  return res.json({ ok: true });
});

export default router;
