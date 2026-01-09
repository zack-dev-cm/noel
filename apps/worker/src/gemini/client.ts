import { GoogleGenerativeAI } from '@google/generative-ai';
import { logEvent } from '../observability/logger.js';
import { withRetry } from '../utils/retry.js';
import { truncateText } from '../utils/text.js';

export interface SubjectTurnInput {
  prompt: string;
  model: string;
  maxOutputTokens?: number;
  maxOutputChars?: number;
}

export interface SubjectTurnResult {
  text: string;
}

export async function runSubjectTurn({
  prompt,
  model,
  maxOutputTokens,
  maxOutputChars
}: SubjectTurnInput): Promise<SubjectTurnResult> {
  if (!process.env.GEMINI_API_KEY) {
    return { text: 'Subject: [stub] The observer is embedded in the observation.' };
  }

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const generationConfig =
    typeof maxOutputTokens === 'number' && maxOutputTokens > 0 ? { maxOutputTokens } : undefined;

  const run = async (modelName: string) => {
    const geminiModel = client.getGenerativeModel({ model: modelName, generationConfig });
    const response = await withRetry(() => geminiModel.generateContent(prompt));
    const rawText = response.response.text();
    const text =
      typeof maxOutputChars === 'number' && maxOutputChars > 0 ? truncateText(rawText, maxOutputChars) : rawText;
    return { text };
  };

  try {
    return await run(model);
  } catch (error) {
    const fallback = process.env.GEMINI_FALLBACK_MODEL;
    if (fallback && fallback !== model) {
      logEvent('gemini_fallback', { from: model, to: fallback });
      return await run(fallback);
    }
    throw error;
  }
}
