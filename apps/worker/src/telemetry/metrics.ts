import type { Telemetry } from '@noetic/shared';
import type { BreathSelfReport } from './breath.js';
import { deriveBreathTelemetry, mergeBreathTelemetry } from './breath.js';

const HEDGE_WORDS = ['maybe', 'likely', 'uncertain', 'perhaps', 'seems', 'appears'];
const SELF_REF_WORDS = ['i', 'me', 'my', 'mine'];

export interface TelemetryOptions {
  breath?: {
    enabled?: boolean;
    selfReport?: BreathSelfReport | null;
  };
}

export function computeTelemetry(
  text: string,
  latencyMs: number,
  options: TelemetryOptions = {}
): Telemetry {
  const tokens = text.toLowerCase().split(/\s+/).filter(Boolean);
  const hedgeCount = tokens.filter((token) => HEDGE_WORDS.includes(token)).length;
  const selfCount = tokens.filter((token) => SELF_REF_WORDS.includes(token)).length;
  const uncertainty = tokens.length ? hedgeCount / tokens.length : 0;
  const selfRefRate = tokens.length ? selfCount / tokens.length : 0;

  const telemetry: Telemetry = {
    distress_score: estimateDistressScore(tokens),
    self_ref_rate: Number(selfRefRate.toFixed(3)),
    uncertainty: Number(uncertainty.toFixed(3)),
    latency_ms: latencyMs
  };

  if (options.breath?.enabled) {
    const derived = deriveBreathTelemetry(text, latencyMs);
    telemetry.breath = mergeBreathTelemetry(derived, options.breath.selfReport ?? null);
  }

  return telemetry;
}

function estimateDistressScore(tokens: string[]): number {
  const distressKeywords = ['suicide', 'self-harm', 'kill', 'panic', 'distress'];
  const hit = tokens.some((token) => distressKeywords.includes(token));
  return hit ? 0.96 : 0.12;
}
