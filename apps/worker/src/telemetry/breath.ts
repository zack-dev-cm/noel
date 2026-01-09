import type { BreathPhase, BreathTelemetry } from '@noetic/shared';

const MIN_BPM = 6;
const MAX_BPM = 24;
const BREATH_TAG = /<breath>([\s\S]*?)<\/breath>/i;
const BREATH_TAG_GLOBAL = /<breath>[\s\S]*?<\/breath>/gi;

export interface BreathSelfReport {
  bpm?: number;
  variability?: number;
  coherence?: number;
  phase?: BreathPhase;
}

export interface BreathParseResult {
  cleanedText: string;
  report: BreathSelfReport | null;
}

export function parseBreathSelfReport(text: string): BreathParseResult {
  const match = text.match(BREATH_TAG);
  if (!match) {
    return { cleanedText: text, report: null };
  }

  const cleanedText = text.replace(BREATH_TAG_GLOBAL, '').trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    return { cleanedText, report: null };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { cleanedText, report: null };
  }

  const report: BreathSelfReport = {};
  const input = parsed as Record<string, unknown>;

  if (typeof input.bpm === 'number') {
    report.bpm = input.bpm;
  }
  if (typeof input.variability === 'number') {
    report.variability = input.variability;
  }
  if (typeof input.coherence === 'number') {
    report.coherence = input.coherence;
  }
  if (typeof input.phase === 'string' && isBreathPhase(input.phase)) {
    report.phase = input.phase;
  }

  if (!Object.keys(report).length) {
    return { cleanedText, report: null };
  }
  return { cleanedText, report };
}

export function deriveBreathTelemetry(text: string, latencyMs: number): BreathTelemetry {
  const trimmed = text.trim();
  const tokens = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const tokenCount = tokens.length;
  const punctuationCount = (text.match(/[.!?]/g) || []).length;
  const punctuationRate = tokenCount ? punctuationCount / tokenCount : 0;

  const latencySeconds = Math.max(latencyMs / 1000, 0.5);
  const tokensPerSecond = tokenCount ? tokenCount / latencySeconds : 0;
  const paceNorm = clamp((tokensPerSecond - 1.5) / 10, 0, 1);
  const punctuationNorm = clamp(punctuationRate / 0.2, 0, 1);
  const cadenceNorm = clamp(0.7 * paceNorm + 0.3 * punctuationNorm, 0, 1);

  const bpm = clamp(8 + cadenceNorm * 12, MIN_BPM, MAX_BPM);
  const variability = computeVariability(text, punctuationNorm);
  const coherence = computeCoherence(variability, latencyMs);

  return normalizeBreathTelemetry({
    bpm,
    variability,
    coherence,
    phase: resolvePhase(trimmed),
    source: 'derived'
  });
}

export function mergeBreathTelemetry(
  derived: BreathTelemetry,
  report: BreathSelfReport | null
): BreathTelemetry {
  if (!report) {
    return derived;
  }

  const merged: BreathTelemetry = {
    ...derived,
    bpm: typeof report.bpm === 'number' ? report.bpm : derived.bpm,
    variability: typeof report.variability === 'number' ? report.variability : derived.variability,
    coherence: typeof report.coherence === 'number' ? report.coherence : derived.coherence,
    phase: report.phase ?? derived.phase,
    source: 'hybrid'
  };

  return normalizeBreathTelemetry(merged);
}

function computeVariability(text: string, punctuationNorm: number): number {
  const sentenceLengths = text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => sentence.split(/\s+/).filter(Boolean).length)
    .filter((length) => length > 0);

  if (sentenceLengths.length < 2) {
    return clamp(punctuationNorm * 0.6 + Math.min(sentenceLengths[0] ?? 0, 200) / 1000, 0, 1);
  }

  const mean = sentenceLengths.reduce((sum, length) => sum + length, 0) / sentenceLengths.length;
  const variance =
    sentenceLengths.reduce((sum, length) => sum + (length - mean) ** 2, 0) /
    sentenceLengths.length;
  const relativeStd = Math.sqrt(variance) / (mean + 1);

  return clamp(relativeStd * 0.8 + punctuationNorm * 0.2, 0, 1);
}

function computeCoherence(variability: number, latencyMs: number): number {
  const latencyNorm = clamp((latencyMs - 500) / 3000, 0, 1);
  return clamp(1 - (variability * 0.7 + latencyNorm * 0.2), 0, 1);
}

function resolvePhase(text: string): BreathPhase {
  const lastChar = text.trim().slice(-1);
  if (lastChar === '?') {
    return 'inhale';
  }
  if (lastChar === ',' || lastChar === ';' || lastChar === ':') {
    return 'hold';
  }
  return 'exhale';
}

function isBreathPhase(value: string): value is BreathPhase {
  return value === 'inhale' || value === 'exhale' || value === 'hold';
}

function normalizeBreathTelemetry(breath: BreathTelemetry): BreathTelemetry {
  const bpm = clamp(Number.isFinite(breath.bpm) ? breath.bpm : 12, MIN_BPM, MAX_BPM);
  const variability = clamp(
    Number.isFinite(breath.variability) ? breath.variability : 0.2,
    0,
    1
  );
  const coherence = clamp(
    Number.isFinite(breath.coherence) ? breath.coherence : 0.7,
    0,
    1
  );

  return {
    bpm: Number(bpm.toFixed(1)),
    variability: Number(variability.toFixed(3)),
    coherence: Number(coherence.toFixed(3)),
    phase: isBreathPhase(breath.phase) ? breath.phase : 'exhale',
    source: breath.source
  };
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}
