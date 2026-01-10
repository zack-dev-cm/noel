import { randomUUID } from 'crypto';
import { Router } from 'express';
import type { StorageRepositories, UserRecord } from '@noetic/shared';
import { isAdminUser, parseAdminIdentifiers } from '../auth/adminAccess.js';
import { validateInitData } from '../auth/telegramInit.js';
import { logEvent } from '../observability/logger.js';

const router = Router();

router.post('/api/auth/init', async (req, res) => {
  const { initData, consentAccepted } = req.body as {
    initData?: string;
    consentAccepted?: boolean;
  };

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ ok: false, error: 'bot_token_missing' });
  }

  const maxAge = Number(process.env.INIT_DATA_MAX_AGE_SECONDS || 86400);
  const validation = validateInitData(initData || '', botToken, maxAge);
  if (!validation.ok || !validation.data?.user) {
    logEvent('auth_failed', { reason: validation.error });
    return res.status(401).json({ ok: false, error: validation.error || 'auth_failed' });
  }

  const storage = req.app.locals.storage as StorageRepositories;
  const telegramId = String(validation.data.user.id);
  const adminList = parseAdminIdentifiers(process.env.ADMIN_TELEGRAM_IDS);
  const username = validation.data.user.username ?? null;
  const isOperator = isAdminUser(adminList, telegramId, username);
  let user = await storage.users.getByTelegramId(telegramId);

  if (!user) {
    const now = new Date().toISOString();
    const record: UserRecord = {
      id: randomUUID(),
      telegram_id: telegramId,
      telegram_username: validation.data.user.username ?? null,
      consented_at: null,
      is_operator: false,
      ui_locale: 'en',
      ui_theme: 'light',
      created_at: now,
      updated_at: now
    };
    user = await storage.users.createUser(record);
  }

  if (consentAccepted && !user.consented_at) {
    const now = new Date().toISOString();
    await storage.users.updateConsent(user.id, now);
    user = { ...user, consented_at: now };
  }

  return res.json({
    ok: true,
    userId: user.id,
    consented: Boolean(user.consented_at),
    isOperator: user.is_operator || isOperator,
    preferences: {
      ui_locale: user.ui_locale ?? 'en',
      ui_theme: user.ui_theme ?? 'light'
    }
  });
});

export default router;
