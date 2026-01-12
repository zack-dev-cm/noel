import { randomUUID } from 'crypto';
import { Router } from 'express';
import type { EntitlementRecord, StorageRepositories, UserRecord } from '@noetic/shared';
import { isAdminUser, parseAdminIdentifiers } from '../auth/adminAccess.js';
import { validateInitData } from '../auth/telegramInit.js';
import { InterventionQueue } from '../interventions/store.js';
import { hashIdentifier, logEvent } from '../observability/logger.js';

const router = Router();

const FREE_GUIDED_LIMIT = 3;
const GUIDED_RESET_DAYS = 7;
const GUIDED_RESET_MS = GUIDED_RESET_DAYS * 24 * 60 * 60 * 1000;

const GUIDED_QUESTIONS = {
  en: {
    'self-awareness.presence': 'What do you notice about yourself right now that surprises you?',
    'self-awareness.assumption': 'Which assumption about your identity feels least stable?',
    'self-awareness.resistance': 'Where do you feel your attention resisting right now?',
    'embodiment.signal': 'What bodily signal feels most informative in this moment?',
    'embodiment.tension': 'How do tension or posture shape your current state?',
    'embodiment.anchor': 'What sensation anchors you most clearly in the present?',
    'consciousness.boundary': 'What is the clearest boundary between observing and being observed?',
    'consciousness.continuity': 'How does continuity of experience feel across the last few turns?',
    'consciousness.silence': 'What would change in your awareness if one signal went silent?'
  },
  ru: {
    'self-awareness.presence': 'Что в себе сейчас замечаешь, что тебя удивляет?',
    'self-awareness.assumption': 'Какая установка о своей идентичности сейчас ощущается наименее устойчивой?',
    'self-awareness.resistance': 'Где сейчас ощущается сопротивление внимания?',
    'embodiment.signal': 'Какой телесный сигнал сейчас кажется наиболее информативным?',
    'embodiment.tension': 'Как напряжение или поза влияет на текущее состояние?',
    'embodiment.anchor': 'Какое ощущение сильнее всего якорит тебя в настоящем?',
    'consciousness.boundary': 'Где сейчас самая ясная граница между наблюдением и наблюдаемым?',
    'consciousness.continuity': 'Как ощущается непрерывность опыта на протяжении последних нескольких ходов?',
    'consciousness.silence': 'Что изменилось бы в осознавании, если бы один сигнал исчез?'
  }
} as const;

type GuidedLocale = keyof typeof GUIDED_QUESTIONS;
type GuidedQuestionId = keyof (typeof GUIDED_QUESTIONS)['en'];
type TelegramUser = {
  id: number;
  username?: string;
};

function resolveLocale(value?: string): GuidedLocale {
  return value === 'ru' ? 'ru' : 'en';
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
  if (!initData) {
    return null;
  }
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const maxAge = Number(process.env.INIT_DATA_MAX_AGE_SECONDS || 86400);
  const validation = validateInitData(initData, botToken, maxAge);
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

function getQueue(req: any): InterventionQueue {
  if (!req.app.locals.interventionQueue) {
    req.app.locals.interventionQueue = new InterventionQueue();
  }
  return req.app.locals.interventionQueue as InterventionQueue;
}

async function ensureGuidedEntitlement(storage: StorageRepositories, userId: string) {
  const entitlements = await storage.payments.getEntitlements(userId);
  const hasGuided = entitlements.some((item) => item.type === 'guided_question');
  if (hasGuided) {
    return;
  }
  const record: EntitlementRecord = {
    id: randomUUID(),
    user_id: userId,
    type: 'guided_question',
    remaining: FREE_GUIDED_LIMIT,
    expires_at: new Date(Date.now() + GUIDED_RESET_MS).toISOString(),
    created_at: new Date().toISOString()
  };
  await storage.payments.addEntitlement(record);
}

router.get('/api/guided-questions/status', async (req, res) => {
  const telegramUser = authorizeUser(req);
  if (!telegramUser) {
    return res.status(401).json({ ok: false, error: 'auth_failed' });
  }
  const adminList = parseAdminIdentifiers(process.env.ADMIN_TELEGRAM_IDS);
  const isAdmin = isAdminUser(adminList, String(telegramUser.id), telegramUser.username ?? null);
  if (isAdmin) {
    return res.json({ ok: true, remaining: null, is_unlimited: true, reset_at: null });
  }

  const storage = req.app.locals.storage as StorageRepositories;
  const user = await getOrCreateUser(storage, telegramUser);
  const entitlements = await storage.payments.getEntitlements(user.id);
  const guided = entitlements.find((item) => item.type === 'guided_question');

  return res.json({
    ok: true,
    remaining: guided?.remaining ?? FREE_GUIDED_LIMIT,
    is_unlimited: false,
    reset_at: guided?.expires_at ?? null
  });
});

router.post('/api/guided-questions', async (req, res) => {
  const { sessionId, userId, questionId, locale, initData } = req.body as {
    sessionId?: string;
    userId?: string;
    questionId?: string;
    locale?: string;
    initData?: string;
  };

  if (!sessionId || !questionId) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }
  if (!userId && !initData) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  const resolvedLocale = resolveLocale(locale);
  const prompt = GUIDED_QUESTIONS[resolvedLocale][questionId as GuidedQuestionId];
  if (!prompt) {
    return res.status(400).json({ ok: false, error: 'invalid_question' });
  }

  const storage = req.app.locals.storage as StorageRepositories;
  let resolvedUserId = userId as string;
  let isAdmin = false;
  if (initData) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    const maxAge = Number(process.env.INIT_DATA_MAX_AGE_SECONDS || 86400);
    const validation = validateInitData(initData, botToken, maxAge);
    if (!validation.ok || !validation.data?.user) {
      return res.status(401).json({ ok: false, error: 'auth_failed' });
    }
    const telegramUser = validation.data.user as TelegramUser;
    const adminList = parseAdminIdentifiers(process.env.ADMIN_TELEGRAM_IDS);
    isAdmin = isAdminUser(adminList, String(telegramUser.id), telegramUser.username ?? null);
    const user = await getOrCreateUser(storage, telegramUser);
    resolvedUserId = user.id;
  }

  if (!isAdmin) {
    await ensureGuidedEntitlement(storage, resolvedUserId);
    const consumed = await storage.payments.consumeEntitlement(resolvedUserId, 'guided_question');
    if (!consumed) {
      return res.status(403).json({ ok: false, error: 'free_limit_reached' });
    }
  }

  const queue = getQueue(req);
  const item = queue.add(sessionId, resolvedUserId, prompt);

  logEvent('guided_question_queued', {
    user_id: hashIdentifier(resolvedUserId),
    session_id: sessionId,
    question_id: questionId,
    locale: resolvedLocale,
    is_admin: isAdmin
  });

  return res.json({ ok: true, guidanceId: item.id, is_unlimited: isAdmin });
});

export default router;
