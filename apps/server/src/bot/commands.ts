import type { StorageRepositories } from '@noetic/shared';
import { isAdminUser, parseAdminIdentifiers } from '../auth/adminAccess.js';
import { postChannelWebAppLink } from './channel.js';
import { sendMessage } from './telegram.js';

const CHANNEL_PIN_MESSAGE = 'Open Noetic Mirror to watch the live session.';

function isOperator(telegramId: string, username?: string | null) {
  const adminList = parseAdminIdentifiers(process.env.ADMIN_TELEGRAM_IDS);
  return isAdminUser(adminList, telegramId, username ?? null);
}

export async function handleCommand(
  botToken: string,
  command: string,
  chatId: number,
  telegramId: string,
  storage: StorageRepositories,
  username?: string | null
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
    case '/post_tma': {
      if (!isOperator(telegramId, username)) {
        await sendMessage(botToken, chatId, 'Not authorized to post channel links.');
        return;
      }
      const channelUrl = process.env.WEB_APP_TMA_URL || baseUrl;
      if (!channelUrl) {
        await sendMessage(botToken, chatId, 'WEB_APP_URL or WEB_APP_TMA_URL is not configured.');
        return;
      }
      const result = await postChannelWebAppLink(botToken, channelUrl, CHANNEL_PIN_MESSAGE);
      if (!result.ok) {
        const details = result.description ? ` (${result.description})` : '';
        await sendMessage(botToken, chatId, `Failed to post channel link${details}.`);
        return;
      }
      await sendMessage(
        botToken,
        chatId,
        'Posted the WebApp link to the public channel. Pin it for the Open button.'
      );
      return;
    }
    case '/help':
    default: {
      await sendMessage(
        botToken,
        chatId,
        'Commands: /start, /balance, /history, /sponsor, /help, /post_tma (admin)'
      );
    }
  }
}
