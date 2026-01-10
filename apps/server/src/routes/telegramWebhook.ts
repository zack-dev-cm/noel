import crypto from 'crypto';
import { Router } from 'express';
import type { EntitlementRecord, StorageRepositories } from '@noetic/shared';
import { handleCommand } from '../bot/commands.js';
import { postChannelUpdate } from '../bot/channel.js';
import { getPaymentCatalogItem } from '../payments/catalog.js';
import { hashIdentifier, logEvent } from '../observability/logger.js';
import { answerPreCheckoutQuery } from '../payments/telegram.js';

const router = Router();

router.post('/telegram/webhook/:secret', async (req, res) => {
  const expected = process.env.WEBHOOK_SECRET || '';
  if (expected && req.params.secret !== expected) {
    return res.status(403).json({ ok: false });
  }

  const update = req.body as any;
  const storage = req.app.locals.storage as StorageRepositories;
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';

  if (update?.pre_checkout_query) {
    await answerPreCheckoutQuery(botToken, update.pre_checkout_query.id);
    return res.json({ ok: true });
  }

  if (update?.message?.text?.startsWith('/')) {
    const text = update.message.text.trim().split(' ')[0];
    const chatId = update.message.chat?.id;
    const telegramId = String(update.message.from?.id || '');
    const username = update.message.from?.username ?? null;
    if (chatId) {
      await handleCommand(botToken, text, chatId, telegramId, storage, username);
    }
    return res.json({ ok: true });
  }

  if (update?.message?.successful_payment) {
    const payment = update.message.successful_payment;
    const payload = payment.invoice_payload as string;
    await storage.payments.markPaid(payload, new Date().toISOString());

    const fromId = String(update.message.from?.id || '');
    const user = await storage.users.getByTelegramId(fromId);
    if (user) {
      const parts = payload.split(':');
      const type = parts[1] ?? 'unknown';
      const item = getPaymentCatalogItem(type);

      if (!item) {
        logEvent('payment_unknown_type', { user_id: hashIdentifier(user.id), type });
        return res.json({ ok: true });
      }

      for (const entitlement of item.entitlements) {
        const record: EntitlementRecord = {
          id: crypto.randomUUID(),
          user_id: user.id,
          type: entitlement.type,
          remaining: entitlement.remaining,
          created_at: new Date().toISOString(),
          expires_at: null
        };
        await storage.payments.addEntitlement(record);
      }

      await postChannelUpdate(botToken, `Payment received: ${item.title}.`);
      logEvent('payment_received', { user_id: hashIdentifier(user.id), type: item.type, amount: item.amount });
    }
  }

  return res.json({ ok: true });
});

export default router;
