export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const RETRYABLE_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504]);
const RETRYABLE_CODES = new Set(['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND']);

function getStatus(error: any): number | undefined {
  if (typeof error?.status === 'number') {
    return error.status;
  }
  if (typeof error?.response?.status === 'number') {
    return error.response.status;
  }
  return undefined;
}

function defaultShouldRetry(error: unknown): boolean {
  const status = getStatus(error as any);
  if (status && RETRYABLE_STATUSES.has(status)) {
    return true;
  }
  const code = (error as any)?.code;
  if (typeof code === 'string' && RETRYABLE_CODES.has(code)) {
    return true;
  }
  return false;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const retries = options.retries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 4000;
  const jitter = options.jitter ?? 0.2;
  const shouldRetry = options.shouldRetry ?? defaultShouldRetry;

  let attempt = 0;
  let delay = baseDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error)) {
        throw error;
      }
      const jitterMs = delay * jitter * Math.random();
      await sleep(delay + jitterMs);
      delay = Math.min(delay * 2, maxDelayMs);
      attempt += 1;
    }
  }
}
