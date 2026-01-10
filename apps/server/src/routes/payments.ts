import { randomUUID } from 'crypto';
import { Router } from 'express';
import type { PaymentRecord, StorageRepositories } from '@noetic/shared';
import { validateInitData } from '../auth/telegramInit.js';
import { getPaymentCatalogItem } from '../payments/catalog.js';
import { createInvoiceLink } from '../payments/telegram.js';

const router = Router();

router.post('/api/payments/invoice', async (req, res) => {
  const { type, initData } = req.body as { type?: string; initData?: string };
  if (!type || !initData) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  const item = getPaymentCatalogItem(type);
  if (!item) {
    return res.status(400).json({ ok: false, error: 'invalid_type' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ ok: false, error: 'bot_token_missing' });
  }

  const validation = validateInitData(initData, botToken, Number(process.env.INIT_DATA_MAX_AGE_SECONDS || 86400));
  if (!validation.ok || !validation.data?.user) {
    return res.status(401).json({ ok: false, error: 'auth_failed' });
  }

  const storage = req.app.locals.storage as StorageRepositories;
  const telegramId = String(validation.data.user.id);
  let user = await storage.users.getByTelegramId(telegramId);
  if (!user) {
    const now = new Date().toISOString();
    user = await storage.users.createUser({
      id: randomUUID(),
      telegram_id: telegramId,
      telegram_username: validation.data.user.username ?? null,
      consented_at: null,
      is_operator: false,
      ui_locale: 'en',
      ui_theme: 'light',
      created_at: now,
      updated_at: now
    });
  }

  const amount = item.amount;
  const payload = `noel:${type}:${telegramId}:${randomUUID()}`;

  try {
    const invoiceLink = await createInvoiceLink(botToken, {
      title: item.title,
      description: item.description,
      payload,
      amount
    });

    const record: PaymentRecord = {
      id: randomUUID(),
      user_id: user.id,
      invoice_payload: payload,
      amount,
      currency: 'XTR',
      status: 'pending',
      created_at: new Date().toISOString(),
      paid_at: null
    };
    await storage.payments.createInvoice(record);

    return res.json({ invoice_link: invoiceLink, amount, currency: 'XTR' });
  } catch (error) {
    return res.status(502).json({ ok: false, error: 'invoice_failed' });
  }
});

export default router;
