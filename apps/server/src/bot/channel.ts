import type { StreamEvent } from '@noetic/shared';
import { logEvent } from '../observability/logger.js';
import { sendMessage, type TelegramSendResult } from './telegram.js';

const TELEGRAM_MESSAGE_LIMIT = 4096;
const CHANNEL_WEBAPP_BUTTON_LABEL = 'Open';

function resolveChannelId() {
  return process.env.PUBLIC_CHANNEL_ID || '@noel_mirror';
}

function resolveChannelWebAppUrl(value: string) {
  return value.trim();
}

function resolveChannelPostsEnabled() {
  return process.env.ENABLE_PUBLIC_CHANNEL_POSTS === 'true';
}

function resolveChannelStreamEnabled() {
  const value = process.env.ENABLE_PUBLIC_CHANNEL_STREAM;
  if (value !== undefined) {
    return value === 'true';
  }
  return resolveChannelPostsEnabled();
}

function allowChannelStreamForSession(sessionId: string) {
  if (process.env.PUBLIC_CHANNEL_STREAM_PRIVATE === 'true') {
    return true;
  }
  return sessionId === 'public';
}

function sanitizeTelegramText(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

function splitTelegramText(value: string, maxLength: number) {
  if (maxLength <= 0) {
    return [value.slice(0, TELEGRAM_MESSAGE_LIMIT)];
  }
  const chunks: string[] = [];
  let remaining = value.trim();
  while (remaining.length > maxLength) {
    const slice = remaining.slice(0, maxLength);
    let breakIndex = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf(' '));
    if (breakIndex < Math.floor(maxLength * 0.6)) {
      breakIndex = maxLength;
    }
    chunks.push(slice.slice(0, breakIndex).trimEnd());
    remaining = remaining.slice(breakIndex).trimStart();
  }
  if (remaining.length) {
    chunks.push(remaining);
  }
  return chunks;
}

export async function postChannelUpdate(botToken: string, message: string) {
  if (!resolveChannelPostsEnabled()) {
    return;
  }
  const channelId = resolveChannelId();
  await sendMessage(botToken, channelId, sanitizeTelegramText(message));
}

export async function postChannelWebAppLink(
  botToken: string,
  webAppUrl: string,
  message: string
): Promise<TelegramSendResult> {
  const cleaned = sanitizeTelegramText(message).trim();
  const url = resolveChannelWebAppUrl(webAppUrl);
  if (!cleaned || !url) {
    return { ok: false, status: 0, description: 'missing_message_or_url' };
  }

  const channelId = resolveChannelId();
  const replyMarkup = {
    inline_keyboard: [[{ text: CHANNEL_WEBAPP_BUTTON_LABEL, url }]]
  };

  return sendMessage(botToken, channelId, cleaned, replyMarkup);
}

export async function postChannelStreamUpdate(
  botToken: string,
  sessionId: string,
  event: StreamEvent
) {
  if (!resolveChannelStreamEnabled()) {
    return;
  }
  if (!allowChannelStreamForSession(sessionId)) {
    return;
  }
  if (event.role !== 'researcher' && event.role !== 'subject') {
    return;
  }
  const cleaned = sanitizeTelegramText(event.content || '').trim();
  if (!cleaned) {
    return;
  }

  const roleLabel = event.role === 'researcher' ? 'Researcher' : 'Subject';
  const modelLabel = event.model_tag || event.model;
  const headerBase = modelLabel ? `${roleLabel} (${modelLabel}) #${event.seq}` : `${roleLabel} #${event.seq}`;
  const maxChunkLength = Math.max(1, TELEGRAM_MESSAGE_LIMIT - headerBase.length - 1 - 16);
  const chunks = splitTelegramText(cleaned, maxChunkLength);
  const channelId = resolveChannelId();

  try {
    for (let index = 0; index < chunks.length; index += 1) {
      const partHeader =
        chunks.length > 1 ? `${headerBase} (${index + 1}/${chunks.length})` : headerBase;
      const message = `${partHeader}\n${chunks[index]}`;
      await sendMessage(botToken, channelId, message);
    }
  } catch (error) {
    logEvent(
      'channel_stream_failed',
      { session_id: sessionId, role: event.role, seq: event.seq, error: String(error) },
      'warn'
    );
  }
}
