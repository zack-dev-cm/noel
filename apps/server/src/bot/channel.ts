import { sendMessage } from './telegram.js';

export async function postChannelUpdate(botToken: string, message: string) {
  if (process.env.ENABLE_PUBLIC_CHANNEL_POSTS !== 'true') {
    return;
  }
  const channelId = process.env.PUBLIC_CHANNEL_ID || '@noel_mirror';
  await sendMessage(botToken, channelId, message);
}
