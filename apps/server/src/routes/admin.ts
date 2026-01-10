import { Router } from 'express';
import type { StorageRepositories } from '@noetic/shared';
import { isAdminUser, parseAdminIdentifiers } from '../auth/adminAccess.js';
import { validateInitData } from '../auth/telegramInit.js';
import { hashIdentifier, logEvent } from '../observability/logger.js';

const router = Router();

type ModelVersions = {
  researcher: string;
  subject: string;
  subject_fallback?: string;
};

function getModelVersions(): ModelVersions {
  const fallback = process.env.GEMINI_FALLBACK_MODEL;
  return {
    researcher: process.env.OPENAI_RESEARCHER_MODEL || 'gpt-5.2-2025-12-11',
    subject: process.env.GEMINI_MODEL || 'gemini-3-pro-preview',
    ...(fallback ? { subject_fallback: fallback } : {})
  };
}

function isAdmin(telegramId?: string | null, username?: string | null): boolean {
  if (!telegramId && !username) {
    return false;
  }
  const admins = parseAdminIdentifiers(process.env.ADMIN_TELEGRAM_IDS);
  return isAdminUser(admins, telegramId, username);
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

function authorizeAdmin(req: any): { telegramId?: string } | null {
  const streamToken = process.env.STREAM_PUBLISH_TOKEN;
  if (streamToken && req.headers['x-stream-token'] === streamToken) {
    return { telegramId: undefined };
  }

  const initData = extractInitData(req);
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const maxAge = Number(process.env.INIT_DATA_MAX_AGE_SECONDS || 86400);
  const validation = validateInitData(initData || '', botToken, maxAge);
  if (!validation.ok || !validation.data?.user) {
    return null;
  }
  const telegramId = String(validation.data.user.id);
  const username = validation.data.user.username ?? null;
  if (!isAdmin(telegramId, username)) {
    return null;
  }
  return { telegramId };
}

router.get('/api/admin/settings', async (req, res) => {
  const auth = authorizeAdmin(req);
  if (!auth) {
    return res.status(403).json({ ok: false, error: 'admin_required' });
  }

  const storage = req.app.locals.storage as StorageRepositories;
  const settings = await storage.admin.getSettings();
  const modelVersions = getModelVersions();
  if (auth.telegramId) {
    logEvent('admin_settings_read', { user_id: hashIdentifier(auth.telegramId) });
  }
  return res.json({ ok: true, settings, model_versions: modelVersions });
});

router.post('/api/admin/settings', async (req, res) => {
  const auth = authorizeAdmin(req);
  if (!auth || !auth.telegramId) {
    return res.status(403).json({ ok: false, error: 'admin_required' });
  }

  const { tokenSaverEnabled } = req.body as { tokenSaverEnabled?: boolean };
  if (typeof tokenSaverEnabled !== 'boolean') {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  const storage = req.app.locals.storage as StorageRepositories;
  const settings = await storage.admin.updateSettings({
    token_saver_enabled: tokenSaverEnabled,
    updated_by: auth.telegramId
  });
  const modelVersions = getModelVersions();

  logEvent('admin_settings_updated', {
    user_id: hashIdentifier(auth.telegramId),
    token_saver_enabled: settings.token_saver_enabled
  });
  return res.json({ ok: true, settings, model_versions: modelVersions });
});

export default router;
