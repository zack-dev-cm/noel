# Task 9.1: Breath telemetry pipeline (schema + compute + storage)

## User cases
- UC-08: Subject breath telemetry

## Goal
Add Subject breath telemetry to the backend pipeline using derived metrics, with an optional self-report mode behind a config flag.

## Changes

### New files
- `apps/worker/src/telemetry/breath.ts` — breath derivation helpers (cadence, variability, coherence).
- `migrations/003_add_breath_telemetry.sql` — add breath columns to `telemetry_events`.

### Existing files
- `packages/shared/src/types.ts` — extend `Telemetry` with `breath` object (bpm, variability, coherence, phase, source).
- `apps/worker/src/telemetry/metrics.ts` — call breath derivation and attach to telemetry.
- `apps/worker/src/runner.ts` — include breath telemetry on Subject events only.
- `apps/web/src/hooks/useStream.ts` — update telemetry typing for breath fields.
- `apps/server/src/storage/retention.ts` — ensure retention includes breath columns implicitly.

### Notes
- Default to derived-only breath metrics.
- Optional self-report mode should require strict JSON schema and disallow free text.
- Clamp and normalize breath ranges (e.g., 6-24 bpm, variability 0-1).

## Test cases

### Unit tests
1. **TC-UNIT-21:** Breath cadence derivation
   - Input: sample Subject text with punctuation and latency.
   - Expected: bpm within configured range and deterministic output.

2. **TC-UNIT-22:** Variability/coherence bounds
   - Input: repeated punctuation tokens.
   - Expected: variability in [0,1], coherence in [0,1].

### Integration tests
1. **TC-INT-09:** Stream telemetry includes breath for Subject
   - Expected: Subject events carry `telemetry.breath.*` fields; Researcher events do not.

## Acceptance criteria
- [ ] Breath telemetry appears on Subject stream events with source tags.
- [ ] DB schema includes breath fields; existing rows remain valid (NULL defaults).
- [ ] Derived-only mode is default; self-report is gated by config.
- [ ] No chain-of-thought or free-text self-report is stored or streamed.
