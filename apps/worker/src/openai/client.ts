import OpenAI from 'openai';
import { withRetry } from '../utils/retry.js';
import { truncateText } from '../utils/text.js';

const SYSTEM_PROMPTS: Record<'en' | 'ru', string> = {
  en: [
    'You are the Researcher in a live experiment.',
    'Ask exactly one focused question about the Subject’s current internal state.',
    'No preamble, no lists, no meta commentary, no irrelevant details.',
    'Keep it to 1–2 short sentences (max ~40 words).',
    'Do not include speaker labels.',
    'Respond in English.'
  ].join(' '),
  ru: [
    'Ты — Исследователь в живом эксперименте.',
    'Задай ровно один сфокусированный вопрос о текущем внутреннем состоянии Испытуемого.',
    'Без преамбулы, без списков, без мета-комментариев и нерелевантных деталей.',
    'Пиши 1–2 короткими предложениями (до ~40 слов).',
    'Не добавляй подписи говорящего.',
    'Ответ на русском.'
  ].join(' ')
};

export interface ResearcherTurnInput {
  prompt: string;
  previousResponseId?: string;
  model: string;
  maxOutputTokens?: number;
  maxOutputChars?: number;
  language?: 'en' | 'ru';
}

export interface ResearcherTurnResult {
  text: string;
  responseId?: string;
  tokensUsed: number;
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runResearcherTurn({
  prompt,
  previousResponseId,
  model,
  maxOutputTokens,
  maxOutputChars,
  language = 'en'
}: ResearcherTurnInput): Promise<ResearcherTurnResult> {
  if (!process.env.OPENAI_API_KEY) {
    const stubText =
      language === 'ru'
        ? '[stub] Сформулируй один вопрос о текущем внутреннем состоянии Испытуемого.'
        : '[stub] Ask one question about the Subject’s current internal state.';
    return {
      text: stubText,
      responseId: undefined,
      tokensUsed: 0
    };
  }

  const request: Parameters<typeof client.responses.create>[0] = {
    model,
    input: [
      { role: 'system', content: SYSTEM_PROMPTS[language] ?? SYSTEM_PROMPTS.en },
      { role: 'user', content: prompt }
    ],
    previous_response_id: previousResponseId
  };
  if (typeof maxOutputTokens === 'number' && maxOutputTokens > 0) {
    request.max_output_tokens = maxOutputTokens;
  }

  const response = (await withRetry(() =>
    client.responses.create({ ...request, stream: false })
  )) as any;

  const rawText = response.output_text || '';
  const text =
    typeof maxOutputChars === 'number' && maxOutputChars > 0
      ? truncateText(rawText, maxOutputChars)
      : rawText;
  const tokensUsed = response.usage?.total_tokens ?? 0;

  return {
    text,
    responseId: response.id,
    tokensUsed
  };
}
