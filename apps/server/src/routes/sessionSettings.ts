import { randomUUID } from 'crypto';
import { Router } from 'express';
import type { SessionRecord, StorageRepositories, UserRecord } from '@noetic/shared';
import { validateInitData } from '../auth/telegramInit.js';
import { hashIdentifier, logEvent } from '../observability/logger.js';

const router = Router();
const PUBLIC_SESSION_UUID = process.env.PUBLIC_SESSION_UUID || '00000000-0000-0000-0000-000000000000';

type TelegramUser = {
  id: number;
  username?: string;
};

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

async function getOrCreateUser(storage: StorageRepositories, telegramUser: TelegramUser): Promise<UserRecord> {
  const telegramId = String(telegramUser.id);
  const existing = await storage.users.getByTelegramId(telegramId);
  if (existing) {
    return existing;
  }
  const now = new Date().toISOString();
  const record: UserRecord = {
    id: randomUUID(),
    telegram_id: telegramId,
    telegram_username: telegramUser.username ?? null,
    consented_at: null,
    is_operator: false,
    ui_locale: 'en',
    ui_theme: 'light',
    created_at: now,
    updated_at: now
  };
  return storage.users.createUser(record);
}

async function ensureSession(
  storage: StorageRepositories,
  sessionId: string,
  userId?: string | null,
  session_language?: SessionRecord['session_language'],
  isPublicSession = false
): Promise<SessionRecord> {
  const existing = await storage.sessions.getSession(sessionId);
  if (existing) {
    return existing;
  }
  const now = new Date().toISOString();
  const defaultLanguage = process.env.DEFAULT_SESSION_LANGUAGE === 'ru' ? 'ru' : 'en';
  const resolvedLanguage = session_language ?? defaultLanguage;
  const type = isPublicSession || !userId ? 'public' : 'private';
  const record: SessionRecord = {
    id: sessionId,
    user_id: userId ?? null,
    type,
    status: 'running',
    researcher_model: process.env.OPENAI_RESEARCHER_MODEL || 'gpt-5.2-2025-12-11',
    subject_model: process.env.GEMINI_MODEL || 'gemini-3-pro-preview',
    session_language: resolvedLanguage,
    created_at: now,
    started_at: now,
    ended_at: null
  };
  return storage.sessions.createSession(record);
}

function resolveSessionId(sessionId: string): string {
  return sessionId === 'public' ? PUBLIC_SESSION_UUID : sessionId;
}

function allowStreamToken(req: any): boolean {
  const token = process.env.STREAM_PUBLISH_TOKEN;
  return Boolean(token && req.headers['x-stream-token'] === token);
}

router.get('/api/sessions/:id/settings', async (req, res) => {
  const sessionId = req.params.id;
  const storageSessionId = resolveSessionId(sessionId);
  const isPublicSession = sessionId === 'public';
  const storage = req.app.locals.storage as StorageRepositories;
  let userId: string | null = null;

  if (!allowStreamToken(req)) {
    const telegramUser = authorizeUser(req);
    if (!telegramUser) {
      return res.status(401).json({ ok: false, error: 'auth_failed' });
    }
    const user = await getOrCreateUser(storage, telegramUser);
    userId = user.id;
  }

  const session = await ensureSession(storage, storageSessionId, userId, undefined, isPublicSession);
  logEvent('session_settings_read', {
    session_id: sessionId,
    source: allowStreamToken(req) ? 'stream' : 'user'
  });
  return res.json({ ok: true, session_language: session.session_language });
});

router.post('/api/sessions/:id/settings', async (req, res) => {
  if (allowStreamToken(req)) {
    return res.status(403).json({ ok: false, error: 'user_required' });
  }

  const telegramUser = authorizeUser(req);
  if (!telegramUser) {
    return res.status(401).json({ ok: false, error: 'auth_failed' });
  }

  const sessionId = req.params.id;
  const storageSessionId = resolveSessionId(sessionId);
  const isPublicSession = sessionId === 'public';
  const { session_language } = req.body as { session_language?: SessionRecord['session_language'] };
  if (session_language !== 'en' && session_language !== 'ru') {
    return res.status(400).json({ ok: false, error: 'invalid_session_language' });
  }

  const storage = req.app.locals.storage as StorageRepositories;
  const user = await getOrCreateUser(storage, telegramUser);
  await ensureSession(storage, storageSessionId, user.id, session_language, isPublicSession);
  const updated = await storage.sessions.updateSessionLanguage(storageSessionId, session_language);

  logEvent('session_language_updated', {
    session_id: sessionId,
    user_id: hashIdentifier(String(telegramUser.id)),
    session_language: updated.session_language
  });

  return res.json({ ok: true, session_language: updated.session_language });
});

export default router;
