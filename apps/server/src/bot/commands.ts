import type { StorageRepositories } from '@noetic/shared';
import { sendMessage } from './telegram.js';

export async function handleCommand(
  botToken: string,
  command: string,
  chatId: number,
  telegramId: string,
  storage: StorageRepositories
) {
  const baseUrl = process.env.WEB_APP_URL || '';

  switch (command) {
    case '/start': {
      const text =
        'Welcome to Noetic Mirror. Open the WebApp to view live research sessions and sponsor interventions.';
      const replyMarkup = baseUrl
        ? {
            inline_keyboard: [[{ text: 'Open WebApp', web_app: { url: baseUrl } }]]
          }
        : undefined;
      await sendMessage(botToken, chatId, text, replyMarkup);
      return;
    }
    case '/balance': {
      const user = await storage.users.getByTelegramId(telegramId);
      const entitlements = user ? await storage.payments.getEntitlements(user.id) : [];
      const total = entitlements.reduce((sum, item) => sum + item.remaining, 0);
      await sendMessage(botToken, chatId, `Entitlements available: ${total}`);
      return;
    }
    case '/history': {
      await sendMessage(botToken, chatId, 'History is not available yet.');
      return;
    }
    case '/sponsor': {
      await sendMessage(botToken, chatId, 'Open the WebApp and tap Stars to sponsor a session.');
      return;
    }
    case '/help':
    default: {
      await sendMessage(botToken, chatId, 'Commands: /start, /balance, /history, /sponsor, /help');
    }
  }
}
