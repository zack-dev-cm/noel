import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

export async function checkModeration(text: string): Promise<ModerationResult> {
  if (!process.env.OPENAI_API_KEY) {
    return { allowed: true };
  }

  const response = await client.moderations.create({
    model: 'omni-moderation-latest',
    input: text
  });

  const result = response.results[0];
  if (result.flagged) {
    return { allowed: false, reason: 'moderation_flagged' };
  }

  return { allowed: true };
}
