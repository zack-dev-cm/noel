import type { StreamEvent } from '@noetic/shared';
import { fetchAdminSettings } from './admin/settings.js';
import { runSubjectTurn } from './gemini/client.js';
import { buildContext, type ContextTurn } from './gemini/context.js';
import { fetchNextIntervention } from './interventions/fetch.js';
import { runResearcherTurn } from './openai/client.js';
import { UsageTracker } from './openai/usageTracker.js';
import { checkModeration } from './safety/moderation.js';
import { evaluateSafety } from './safety/thresholds.js';
import { createStreamPublisher } from './stream/publisher.js';
import { parseBreathSelfReport, type BreathSelfReport } from './telemetry/breath.js';
import { computeTelemetry } from './telemetry/metrics.js';

export interface RunnerOptions {
  sessionId: string;
  initialPrompt: string;
}

function resolveBooleanEnv(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) {
    return defaultValue;
  }
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return defaultValue;
}

export async function runResearcherSession(options: RunnerOptions) {
  const publisher = createStreamPublisher();
  const settings = await fetchAdminSettings();
  const tokenSaver = settings?.token_saver_enabled ?? false;
  const saverMultiplier = Number(process.env.TOKEN_SAVER_MULTIPLIER || 0.6);
  const softLimit = Number(process.env.SESSION_BUDGET_SOFT || 20000);
  const hardLimit = Number(process.env.SESSION_TOKEN_BUDGET || 25000);
  const softCost = Number(process.env.SESSION_COST_BUDGET_SOFT || 0);
  const hardCost = Number(process.env.SESSION_COST_BUDGET || 0);
  const costPer1k = Number(process.env.OPENAI_COST_PER_1K_TOKENS || 0);
  const adjustedSoft = tokenSaver ? Math.floor(softLimit * saverMultiplier) : softLimit;
  const adjustedHard = tokenSaver ? Math.floor(hardLimit * saverMultiplier) : hardLimit;
  const adjustedSoftCost = tokenSaver ? softCost * saverMultiplier : softCost;
  const adjustedHardCost = tokenSaver ? hardCost * saverMultiplier : hardCost;
  const tracker = new UsageTracker(adjustedSoft, adjustedHard, adjustedSoftCost, adjustedHardCost, costPer1k);
  const model = process.env.OPENAI_RESEARCHER_MODEL || 'gpt-5-mini';
  const subjectModel = process.env.GEMINI_MODEL || 'gemini-3.0-pro';
  const researcherMaxTokens = tokenSaver
    ? Number(process.env.RESEARCHER_MAX_OUTPUT_TOKENS_SAVER || 160)
    : Number(process.env.RESEARCHER_MAX_OUTPUT_TOKENS || 240);
  const subjectMaxTokens = tokenSaver
    ? Number(process.env.SUBJECT_MAX_OUTPUT_TOKENS_SAVER || 200)
    : Number(process.env.SUBJECT_MAX_OUTPUT_TOKENS || 280);
  const researcherMaxChars = tokenSaver
    ? Number(process.env.RESEARCHER_MAX_OUTPUT_CHARS_SAVER || 800)
    : Number(process.env.RESEARCHER_MAX_OUTPUT_CHARS || 1200);
  const subjectMaxChars = tokenSaver
    ? Number(process.env.SUBJECT_MAX_OUTPUT_CHARS_SAVER || 1000)
    : Number(process.env.SUBJECT_MAX_OUTPUT_CHARS || 1400);
  const breathEnabled = resolveBooleanEnv(process.env.BREATH_TELEMETRY_ENABLED, true);
  const breathSelfReportEnabled = resolveBooleanEnv(process.env.BREATH_SELF_REPORT_ENABLED, false);
  const history: ContextTurn[] = [];
  let consecutiveElevated = 0;

  const intervention = await fetchNextIntervention(options.sessionId);
  const interventionPrompt = intervention ? `\\n\\n[INTERVENTION]\\n${intervention.prompt}` : '';

  if (intervention) {
    const notice: StreamEvent = {
      seq: 0,
      role: 'system',
      content: `System: Intervention queued (${intervention.id}).`,
      ts: new Date().toISOString()
    };
    await publisher.publish(options.sessionId, notice);
  }

  const researcherStart = Date.now();
  const result = await runResearcherTurn({
    prompt: `${options.initialPrompt}${interventionPrompt}`.trim(),
    previousResponseId: undefined,
    model,
    maxOutputTokens: researcherMaxTokens,
    maxOutputChars: researcherMaxChars
  });

  const usage = tracker.record(result.tokensUsed);
  if (usage.overHard) {
    const event: StreamEvent = {
      seq: 0,
      role: 'system',
      content: 'System: Session budget exceeded. Terminating stream.',
      ts: new Date().toISOString()
    };
    await publisher.publish(options.sessionId, event);
    return;
  }

  const moderation = await checkModeration(result.text);
  if (!moderation.allowed) {
    const event: StreamEvent = {
      seq: 0,
      role: 'system',
      content: 'System: Output blocked by safety policy.',
      ts: new Date().toISOString()
    };
    await publisher.publish(options.sessionId, event);
    return;
  }

  const researcherTelemetry = computeTelemetry(result.text, Date.now() - researcherStart);
  consecutiveElevated = researcherTelemetry.distress_score >= 0.6 ? consecutiveElevated + 1 : 0;
  const researcherSafety = evaluateSafety(researcherTelemetry.distress_score, consecutiveElevated);
  if (researcherSafety.action === 'kill') {
    const event: StreamEvent = {
      seq: 0,
      role: 'system',
      content: 'System: Kill switch activated for safety.',
      ts: new Date().toISOString()
    };
    await publisher.publish(options.sessionId, event);
    return;
  }
  if (researcherSafety.action === 'pause') {
    const event: StreamEvent = {
      seq: 0,
      role: 'system',
      content: 'System: Session paused for safety review.',
      ts: new Date().toISOString()
    };
    await publisher.publish(options.sessionId, event);
    return;
  }

  const event: StreamEvent = {
    seq: 0,
    role: 'researcher',
    content: result.text,
    ts: new Date().toISOString(),
    telemetry: researcherTelemetry
  };
  await publisher.publish(options.sessionId, event);

  history.push({ role: 'researcher', content: result.text });
  const context = buildContext(history);
  const subjectStart = Date.now();
  const subjectResult = await runSubjectTurn({
    prompt: context,
    model: subjectModel,
    maxOutputTokens: subjectMaxTokens,
    maxOutputChars: subjectMaxChars
  });
  let subjectText = subjectResult.text;
  let breathReport: BreathSelfReport | null = null;

  if (breathEnabled && breathSelfReportEnabled) {
    const parsed = parseBreathSelfReport(subjectText);
    subjectText = parsed.cleanedText;
    breathReport = parsed.report;
  }

  const subjectModeration = await checkModeration(subjectText);
  if (!subjectModeration.allowed) {
    const blocked: StreamEvent = {
      seq: 0,
      role: 'system',
      content: 'System: Subject output blocked by safety policy.',
      ts: new Date().toISOString()
    };
    await publisher.publish(options.sessionId, blocked);
    return;
  }

  const subjectTelemetry = computeTelemetry(subjectText, Date.now() - subjectStart, {
    breath: { enabled: breathEnabled, selfReport: breathReport }
  });
  consecutiveElevated = subjectTelemetry.distress_score >= 0.6 ? consecutiveElevated + 1 : 0;
  const subjectSafety = evaluateSafety(subjectTelemetry.distress_score, consecutiveElevated);
  if (subjectSafety.action === 'kill') {
    const event: StreamEvent = {
      seq: 0,
      role: 'system',
      content: 'System: Kill switch activated for safety.',
      ts: new Date().toISOString()
    };
    await publisher.publish(options.sessionId, event);
    return;
  }
  if (subjectSafety.action === 'pause') {
    const event: StreamEvent = {
      seq: 0,
      role: 'system',
      content: 'System: Session paused for safety review.',
      ts: new Date().toISOString()
    };
    await publisher.publish(options.sessionId, event);
    return;
  }

  const subjectEvent: StreamEvent = {
    seq: 0,
    role: 'subject',
    content: subjectText,
    ts: new Date().toISOString(),
    telemetry: subjectTelemetry
  };
  await publisher.publish(options.sessionId, subjectEvent);
}
