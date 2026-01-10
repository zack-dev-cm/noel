import { FunctionCallingMode, GoogleGenerativeAI } from '@google/generative-ai';
import { logEvent } from '../observability/logger.js';
import { withRetry } from '../utils/retry.js';

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
  const generationConfig = {
    responseMimeType: 'text/plain',
    ...(typeof maxOutputTokens === 'number' && maxOutputTokens > 0 ? { maxOutputTokens } : {})
  };
  const toolConfig = {
    functionCallingConfig: {
      mode: FunctionCallingMode.NONE
    }
  };

  const emptyFallback: Record<'en' | 'ru', string> = {
    en: 'Response unavailable. Please retry.',
    ru: 'Ответ недоступен. Пожалуйста, повторите попытку.'
  };
  const retryCount = Math.max(0, Number(process.env.GEMINI_RETRY_COUNT || 2));
  const retryBackoffMs = Math.max(0, Number(process.env.GEMINI_RETRY_BACKOFF_MS || 250));
  const minSentenceCount = 2;

  const sleep = (durationMs: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, durationMs);
    });

  const countSentences = (text: string) =>
    text
      .split(/[.!?]+/g)
      .map((part) => part.trim())
      .filter(Boolean).length;

  const summarizeSafetyRatings = (ratings: any) => {
    if (!Array.isArray(ratings)) {
      return null;
    }
    return ratings.map((rating) => ({
      category: rating?.category ?? null,
      probability: rating?.probability ?? null,
      severity: rating?.severity ?? null
    }));
  };

  const summarizeParts = (parts: any) => {
    if (!Array.isArray(parts)) {
      return null;
    }
    return parts.map((part) => {
      if (typeof part?.text === 'string') {
        return { type: 'text', length: part.text.length };
      }
      if (part?.inlineData) {
        const data = part.inlineData?.data;
        return {
          type: 'inlineData',
          mime_type: part.inlineData?.mimeType ?? null,
          size: typeof data === 'string' ? data.length : null
        };
      }
      if (part?.functionCall) {
        return { type: 'functionCall', name: part.functionCall?.name ?? null };
      }
      if (part?.functionResponse) {
        return { type: 'functionResponse', name: part.functionResponse?.name ?? null };
      }
      return { type: typeof part };
    });
  };

  const summarizePromptFeedback = (promptFeedback: any) => {
    if (!promptFeedback) {
      return null;
    }
    return {
      block_reason: promptFeedback.blockReason ?? null,
      block_reason_message: promptFeedback.blockReasonMessage ?? null,
      safety_ratings: summarizeSafetyRatings(promptFeedback.safetyRatings)
    };
  };

  const summarizeCandidate = (candidate: any) => {
    if (!candidate) {
      return null;
    }
    const parts = candidate?.content?.parts;
    const textLength = Array.isArray(parts)
      ? parts
          .map((part) => (typeof part?.text === 'string' ? part.text.length : 0))
          .reduce((sum, value) => sum + value, 0)
      : 0;
    return {
      finish_reason: candidate.finishReason ?? null,
      safety_ratings: summarizeSafetyRatings(candidate.safetyRatings),
      part_summary: summarizeParts(parts),
      content_keys: candidate?.content ? Object.keys(candidate.content) : null,
      content_role: candidate?.content?.role ?? null,
      parts_type: Array.isArray(parts) ? 'array' : typeof parts,
      candidate_keys: Object.keys(candidate ?? {}),
      text_length: textLength || null,
      token_count: candidate.tokenCount ?? null
    };
  };

  const extractText = (response: any) => {
    let text = '';
    let textError: string | null = null;
    let source: 'response_text' | 'parts' | 'none' = 'none';
    if (typeof response?.response?.text === 'function') {
      try {
        text = response.response.text();
      } catch (error) {
        textError = String(error);
        text = '';
      }
    }
    if (text && text.trim().length > 0) {
      source = 'response_text';
      return { text, textError, source };
    }
    const parts = response?.response?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) {
      return { text: text ?? '', textError, source };
    }
    text = parts
      .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim();
    if (text) {
      source = 'parts';
    }
    return { text, textError, source };
  };

  const run = async (modelName: string, attempt: number) => {
    const geminiModel = client.getGenerativeModel({ model: modelName, generationConfig, toolConfig });
    const start = Date.now();
    logEvent(
      'subject_request',
      {
        session_id: sessionId,
        model: modelName,
        attempt,
        prompt_chars: prompt.length,
        max_output_tokens: maxOutputTokens ?? null,
        max_output_chars: maxOutputChars ?? null,
        language
      },
      'debug'
    );
    const response = await withRetry(() => geminiModel.generateContent(prompt));
    const extraction = extractText(response);
    const rawText = extraction.text;
    const overCharCap =
      typeof maxOutputChars === 'number' && maxOutputChars > 0 ? rawText.length > maxOutputChars : false;
    const durationMs = Date.now() - start;
    const candidates = response?.response?.candidates;
    const candidateCount = Array.isArray(candidates) ? candidates.length : 0;
    const candidate = Array.isArray(candidates) ? candidates[0] : null;
    const blockReason = response?.response?.promptFeedback?.blockReason ?? null;
    const finishReason = candidate?.finishReason ?? null;
    const logLevel = overCharCap ? 'warn' : 'info';
    logEvent('subject_response', {
      session_id: sessionId,
      model: modelName,
      output_chars: rawText.length,
      over_char_cap: overCharCap,
      duration_ms: durationMs,
      candidate_count: candidateCount,
      block_reason: blockReason,
      finish_reason: finishReason,
      sentence_count: countSentences(rawText),
      language
    }, logLevel);
    if (!rawText.trim() || blockReason || candidateCount === 0) {
      const functionCall = response?.response?.functionCall;
      const functionCalls = response?.response?.functionCalls;
      logEvent('subject_response_debug', {
        session_id: sessionId,
        model: modelName,
        language,
        output_chars: rawText.length,
        candidate_count: candidateCount,
        text_source: extraction.source,
        text_error: extraction.textError,
        prompt_feedback: summarizePromptFeedback(response?.response?.promptFeedback),
        candidate: summarizeCandidate(candidate),
        usage_metadata: response?.response?.usageMetadata ?? null,
        response_keys: Object.keys(response?.response ?? {}),
        model_version: (response?.response as any)?.modelVersion ?? null,
        response_id: (response?.response as any)?.responseId ?? null,
        function_call_present: Boolean(functionCall) || (Array.isArray(functionCalls) && functionCalls.length > 0),
        function_call_keys: functionCall ? Object.keys(functionCall) : null,
        function_calls_count: Array.isArray(functionCalls) ? functionCalls.length : null
      }, 'warn');
    }
    return { text: rawText, candidateCount, blockReason, finishReason };
  };

  const runWithRetries = async (modelName: string) => {
    for (let attempt = 0; attempt <= retryCount; attempt += 1) {
      const result = await run(modelName, attempt + 1);
      const trimmed = result.text.trim();
      const sentenceCount = countSentences(trimmed);
      const isEmpty = trimmed.length === 0;
      const isBlocked = Boolean(result.blockReason);
      const isTooShort = !isEmpty && sentenceCount < minSentenceCount;

      if (!isEmpty && !isBlocked && !isTooShort) {
        return {
          ok: true,
          text: result.text,
          attempts: attempt + 1,
          sentenceCount,
          isEmpty,
          isBlocked,
          isTooShort,
          candidateCount: result.candidateCount,
          blockReason: result.blockReason,
          finishReason: result.finishReason
        };
      }

      if (attempt < retryCount) {
        const reason = isBlocked ? 'blocked' : isTooShort ? 'too_short' : 'empty_output';
        logEvent(
          'subject_retry',
          {
            session_id: sessionId,
            model: modelName,
            language,
            reason,
            attempt: attempt + 2,
            sentence_count: sentenceCount,
            block_reason: result.blockReason ?? null,
            finish_reason: result.finishReason ?? null
          },
          'warn'
        );
        if (retryBackoffMs > 0) {
          await sleep(retryBackoffMs);
        }
        continue;
      }

      return {
        ok: false,
        text: result.text,
        attempts: attempt + 1,
        sentenceCount,
        isEmpty,
        isBlocked,
        isTooShort,
        candidateCount: result.candidateCount,
        blockReason: result.blockReason,
        finishReason: result.finishReason
      };
    }
    return {
      ok: false,
      text: '',
      attempts: retryCount + 1,
      sentenceCount: 0,
      isEmpty: true,
      isBlocked: false,
      isTooShort: false,
      candidateCount: 0,
      blockReason: null,
      finishReason: null
    };
  };

  try {
    const primary = await runWithRetries(model);
    if (primary.ok) {
      return { text: primary.text };
    }

    if (primary.isEmpty || primary.isBlocked) {
      logEvent(
        'subject_empty_response',
        {
          session_id: sessionId,
          model,
          language,
          attempts: primary.attempts,
          candidate_count: primary.candidateCount ?? 0,
          block_reason: primary.blockReason ?? null,
          finish_reason: primary.finishReason ?? null
        },
        'warn'
      );
      const fallback = process.env.GEMINI_FALLBACK_MODEL;
      if (fallback && fallback !== model) {
        logEvent(
          'subject_fallback_attempt',
          {
            from: model,
            to: fallback,
            reason: primary.isBlocked ? 'blocked' : 'empty_response',
            session_id: sessionId
          },
          'warn'
        );
        const fallbackResult = await runWithRetries(fallback);
        if (fallbackResult.ok) {
          return { text: fallbackResult.text };
        }
        if (fallbackResult.isEmpty || fallbackResult.isBlocked) {
          logEvent(
            'subject_empty_response',
            {
              session_id: sessionId,
              model: fallback,
              language,
              attempts: fallbackResult.attempts,
              candidate_count: fallbackResult.candidateCount ?? 0,
              block_reason: fallbackResult.blockReason ?? null,
              finish_reason: fallbackResult.finishReason ?? null
            },
            'warn'
          );
          return { text: emptyFallback[language] ?? emptyFallback.en };
        }
        if (fallbackResult.isTooShort) {
          logEvent(
            'subject_short_response_final',
            {
              session_id: sessionId,
              model: fallback,
              language,
              attempts: fallbackResult.attempts,
              sentence_count: fallbackResult.sentenceCount
            },
            'warn'
          );
        }
        return { text: fallbackResult.text };
      }
      return { text: emptyFallback[language] ?? emptyFallback.en };
    }

    if (primary.isTooShort) {
      logEvent(
        'subject_short_response_final',
        {
          session_id: sessionId,
          model,
          language,
          attempts: primary.attempts,
          sentence_count: primary.sentenceCount
        },
        'warn'
      );
      return { text: primary.text };
    }

    return { text: emptyFallback[language] ?? emptyFallback.en };
  } catch (error) {
    const fallback = process.env.GEMINI_FALLBACK_MODEL;
    if (fallback && fallback !== model) {
      logEvent('gemini_fallback', { from: model, to: fallback, session_id: sessionId }, 'warn');
      const fallbackResult = await runWithRetries(fallback);
      if (fallbackResult.isTooShort) {
        logEvent(
          'subject_short_response_final',
          {
            session_id: sessionId,
            model: fallback,
            language,
            attempts: fallbackResult.attempts,
            sentence_count: fallbackResult.sentenceCount
          },
          'warn'
        );
      }
      return { text: fallbackResult.text };
    }
    logEvent('subject_error', { session_id: sessionId, error: String(error), language }, 'error');
    throw error;
  }
}
