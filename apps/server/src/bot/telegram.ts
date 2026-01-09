const TELEGRAM_API_BASE = 'https://api.telegram.org';

export async function sendMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  replyMarkup?: Record<string, unknown>
) {
  await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup
    })
  });
}
