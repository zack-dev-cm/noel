const TELEGRAM_API_BASE = 'https://api.telegram.org';

import { logEvent } from '../observability/logger.js';

export async function configureWebhook() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const baseUrl = process.env.WEBHOOK_BASE_URL || process.env.WEB_APP_URL;
  const secret = process.env.WEBHOOK_SECRET;

  if (!botToken || !baseUrl || !secret) {
    logEvent('webhook_setup_skipped', {
      has_token: Boolean(botToken),
      has_base_url: Boolean(baseUrl),
      has_secret: Boolean(secret)
    });
    return;
  }

  const normalizedBase = baseUrl.replace(/\/$/, '');
  const webhookPath = `/telegram/webhook/${secret}`;
  const webhookUrl = `${normalizedBase}${webhookPath}`;

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    });

    if (!response.ok) {
      logEvent('webhook_setup_failed', { status: response.status });
      return;
    }

    const payload = (await response.json()) as { ok?: boolean; description?: string };
    if (!payload.ok) {
      logEvent('webhook_setup_failed', { error: payload.description ?? 'unknown' });
      return;
    }

    logEvent('webhook_configured', {
      base_url: normalizedBase,
      path: `/telegram/webhook/${secret.slice(0, 4)}...`
    });
  } catch (error) {
    logEvent('webhook_setup_failed', { error: String(error) });
  }
}
