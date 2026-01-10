import { GoogleGenerativeAI } from '@google/generative-ai';
import { logEvent } from '../observability/logger.js';
import { withRetry } from '../utils/retry.js';
import { truncateText } from '../utils/text.js';

export interface SubjectTurnInput {
  prompt: string;
  model: string;
  maxOutputTokens?: number;
  maxOutputChars?: number;
  sessionId?: string;
  language?: 'en' | 'ru';
}

export interface SubjectTurnResult {
  text: string;
}

export async function runSubjectTurn({
  prompt,
  model,
  maxOutputTokens,
  maxOutputChars,
  sessionId,
  language = 'en'
}: SubjectTurnInput): Promise<SubjectTurnResult> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      text:
        language === 'ru'
          ? '[stub] Наблюдатель встроен в наблюдение.'
          : '[stub] The observer is embedded in the observation.'
    };
  }

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const generationConfig =
    typeof maxOutputTokens === 'number' && maxOutputTokens > 0 ? { maxOutputTokens } : undefined;

  const emptyFallback: Record<'en' | 'ru', string> = {
    en: 'Response unavailable. Please retry.',
    ru: 'Ответ недоступен. Пожалуйста, повторите попытку.'
  };

  const extractText = (response: any) => {
    const text = typeof response?.response?.text === 'function' ? response.response.text() : '';
    if (text && text.trim().length > 0) {
      return text;
    }
    const parts = response?.response?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) {
      return text;
    }
    return parts
      .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim();
  };

  const run = async (modelName: string) => {
    const geminiModel = client.getGenerativeModel({ model: modelName, generationConfig });
    const start = Date.now();
    logEvent(
      'subject_request',
      {
        session_id: sessionId,
        model: modelName,
        prompt_chars: prompt.length,
        max_output_tokens: maxOutputTokens ?? null,
        max_output_chars: maxOutputChars ?? null,
        language
      },
      'debug'
    );
    const response = await withRetry(() => geminiModel.generateContent(prompt));
    const rawText = extractText(response);
    const text =
      typeof maxOutputChars === 'number' && maxOutputChars > 0 ? truncateText(rawText, maxOutputChars) : rawText;
    const durationMs = Date.now() - start;
    const candidates = response?.response?.candidates;
    const candidateCount = Array.isArray(candidates) ? candidates.length : 0;
    const blockReason = response?.response?.promptFeedback?.blockReason ?? null;
    logEvent('subject_response', {
      session_id: sessionId,
      model: modelName,
      output_chars: text.length,
      duration_ms: durationMs,
      candidate_count: candidateCount,
      block_reason: blockReason,
      language
    });
    return { text, candidateCount, blockReason };
  };

  try {
    const primary = await run(model);
    if (primary.text.trim().length > 0) {
      return { text: primary.text };
    }
    logEvent('subject_empty_response', {
      session_id: sessionId,
      model,
      language,
      candidate_count: primary.candidateCount ?? 0,
      block_reason: primary.blockReason ?? null
    });
    const fallback = process.env.GEMINI_FALLBACK_MODEL;
    if (fallback && fallback !== model) {
      logEvent('subject_fallback_attempt', { from: model, to: fallback, reason: 'empty_response' });
      const fallbackResult = await run(fallback);
      if (fallbackResult.text.trim().length > 0) {
        return { text: fallbackResult.text };
      }
    }
    return { text: emptyFallback[language] ?? emptyFallback.en };
  } catch (error) {
    const fallback = process.env.GEMINI_FALLBACK_MODEL;
    if (fallback && fallback !== model) {
      logEvent('gemini_fallback', { from: model, to: fallback, session_id: sessionId });
      return await run(fallback);
    }
    logEvent('subject_error', { session_id: sessionId, error: String(error), language }, 'error');
    throw error;
  }
}
