import { Router } from 'express';
import type { StorageRepositories, TelemetryEventRecord } from '@noetic/shared';
import { formatModelTag } from '@noetic/shared';
import { validateInitData } from '../auth/telegramInit.js';
import { logEvent } from '../observability/logger.js';

const router = Router();
const PUBLIC_SESSION_UUID = process.env.PUBLIC_SESSION_UUID || '00000000-0000-0000-0000-000000000000';

type TelegramUser = {
  id: number;
  username?: string;
};

function resolveSessionId(sessionId: string): string {
  return sessionId === 'public' ? PUBLIC_SESSION_UUID : sessionId;
}

function extractInitData(req: any): string | null {
  const header = req.headers['x-telegram-init-data'];
  if (typeof header === 'string' && header) {
    return header;
  }
  if (typeof req.query?.initData === 'string') {
    return req.query.initData;
  }
  if (typeof req.body?.initData === 'string') {
    return req.body.initData;
  }
  return null;
}

function authorizeUser(req: any): TelegramUser | null {
  const initData = extractInitData(req);
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const maxAge = Number(process.env.INIT_DATA_MAX_AGE_SECONDS || 86400);
  const validation = validateInitData(initData || '', botToken, maxAge);
  if (!validation.ok || !validation.data?.user) {
    return null;
  }
  return validation.data.user as TelegramUser;
}

function parseLimit(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 50;
  }
  return Math.min(200, Math.floor(parsed));
}

function parseAfterSeq(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.floor(parsed);
}

router.get('/api/sessions/:id/transcript', async (req, res) => {
  const sessionId = req.params.id;
  const storageSessionId = resolveSessionId(sessionId);
  const storage = req.app.locals.storage as StorageRepositories;
  const session = await storage.sessions.getSession(storageSessionId);

  if (!session) {
    return res.status(404).json({ ok: false, error: 'session_not_found' });
  }

  if (session.type !== 'public') {
    const telegramUser = authorizeUser(req);
    if (!telegramUser) {
      return res.status(401).json({ ok: false, error: 'auth_failed' });
    }
    const user = await storage.users.getByTelegramId(String(telegramUser.id));
    if (!user) {
      return res.status(401).json({ ok: false, error: 'auth_failed' });
    }
    if (session.user_id && session.user_id !== user.id && !user.is_operator) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
  }

  const afterSeq = parseAfterSeq(req.query.after_seq);
  const limit = parseLimit(req.query.limit);
  const messages = await storage.transcripts.getMessagesAfterSeq(storageSessionId, afterSeq);
  const telemetryRows = await storage.telemetry.getTelemetryAfterSeq(storageSessionId, afterSeq);
  const telemetryBySeq = new Map<number, TelemetryEventRecord>();
  for (const row of telemetryRows) {
    telemetryBySeq.set(row.seq, row);
  }
  const slice = messages.slice(0, limit + 1);
  const hasMore = slice.length > limit;
  const items = slice.slice(0, limit).map((message) => {
    const model =
      message.role === 'researcher'
        ? session.researcher_model
        : message.role === 'subject'
          ? session.subject_model
          : undefined;
    const modelTag = model ? formatModelTag(model) : null;
    const telemetryRow = telemetryBySeq.get(message.seq);
    const hasBreath =
      telemetryRow?.breath_bpm != null &&
      telemetryRow?.breath_variability != null &&
      telemetryRow?.breath_coherence != null &&
      telemetryRow?.breath_phase != null &&
      telemetryRow?.breath_source != null;
    const telemetry = telemetryRow
      ? {
          distress_score: telemetryRow.distress_score,
          self_ref_rate: telemetryRow.self_ref_rate,
          uncertainty: telemetryRow.uncertainty,
          latency_ms: telemetryRow.latency_ms,
          ...(hasBreath
            ? {
                breath: {
                  bpm: telemetryRow.breath_bpm as number,
                  variability: telemetryRow.breath_variability as number,
                  coherence: telemetryRow.breath_coherence as number,
                  phase: telemetryRow.breath_phase as 'inhale' | 'exhale' | 'hold',
                  source: telemetryRow.breath_source as 'derived' | 'self_report' | 'hybrid'
                }
              }
            : {})
        }
      : undefined;
    return {
      seq: message.seq,
      role: message.role,
      content: message.content,
      ts: message.created_at,
      model,
      model_tag: modelTag ?? undefined,
      telemetry
    };
  });
  const nextCursor = hasMore ? String(items[items.length - 1]?.seq ?? afterSeq) : null;

  logEvent('transcript_read', {
    session_id: sessionId,
    count: items.length,
    after_seq: afterSeq,
    next_cursor: nextCursor
  });

  return res.json({ ok: true, items, next_cursor: nextCursor });
});

export default router;
