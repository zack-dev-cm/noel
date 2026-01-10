import { randomUUID } from 'crypto';
import { Router } from 'express';
import type { StorageRepositories, UserRecord } from '@noetic/shared';
import { validateInitData } from '../auth/telegramInit.js';
import { hashIdentifier, logEvent } from '../observability/logger.js';

const router = Router();

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

router.get('/api/user/preferences', async (req, res) => {
  const telegramUser = authorizeUser(req);
  if (!telegramUser) {
    return res.status(401).json({ ok: false, error: 'auth_failed' });
  }

  const storage = req.app.locals.storage as StorageRepositories;
  const user = await getOrCreateUser(storage, telegramUser);
  return res.json({
    ok: true,
    preferences: { ui_locale: user.ui_locale ?? 'en', ui_theme: user.ui_theme ?? 'light' }
  });
});

router.post('/api/user/preferences', async (req, res) => {
  const telegramUser = authorizeUser(req);
  if (!telegramUser) {
    return res.status(401).json({ ok: false, error: 'auth_failed' });
  }

  const { ui_locale, ui_theme } = req.body as {
    ui_locale?: UserRecord['ui_locale'];
    ui_theme?: UserRecord['ui_theme'];
  };
  const localeAllowed = ui_locale === undefined || ui_locale === 'en' || ui_locale === 'ru';
  const themeAllowed = ui_theme === undefined || ui_theme === 'light' || ui_theme === 'dark';
  if (!localeAllowed || !themeAllowed) {
    return res.status(400).json({ ok: false, error: 'invalid_preferences' });
  }

  const storage = req.app.locals.storage as StorageRepositories;
  const user = await getOrCreateUser(storage, telegramUser);
  const updated = await storage.users.updatePreferences(user.id, { ui_locale, ui_theme });

  logEvent('preferences_updated', {
    user_id: hashIdentifier(String(telegramUser.id)),
    ui_locale: updated.ui_locale,
    ui_theme: updated.ui_theme
  });

  return res.json({
    ok: true,
    preferences: { ui_locale: updated.ui_locale, ui_theme: updated.ui_theme }
  });
});

export default router;
