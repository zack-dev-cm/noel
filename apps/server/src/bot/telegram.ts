import { logEvent } from '../observability/logger.js';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

type TelegramResponse = {
  ok: boolean;
  error_code?: number;
  description?: string;
};

export type TelegramSendResult = {
  ok: boolean;
  status: number;
  error_code?: number;
  description?: string;
};

export async function sendMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<TelegramSendResult> {
  const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup
    })
  });
  let payload: TelegramResponse | null = null;
  try {
    payload = (await response.json()) as TelegramResponse;
  } catch {
    payload = null;
  }
  const ok = response.ok && payload?.ok !== false;
  if (!ok) {
    logEvent(
      'telegram_send_failed',
      {
        status: response.status,
        error_code: payload?.error_code ?? null,
        description: payload?.description?.slice(0, 200) ?? null
      },
      'warn'
    );
  }
  return {
    ok,
    status: response.status,
    error_code: payload?.error_code,
    description: payload?.description
  };
}
