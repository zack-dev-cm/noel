# Task 9.2: Breath UI widget + diagnostics + E2E coverage

## User cases
- UC-08: Subject breath telemetry

## Goal
Expose breath telemetry in the WebApp UI with clear synthetic labeling and diagnostics detail.

## Changes

### New files
- `apps/web/src/components/BreathWidget.tsx` — breath cadence/variability UI card.

### Existing files
- `apps/web/src/App.tsx` — place the breath widget on Dashboard and Diagnostics tab.
- `apps/web/src/hooks/useStream.ts` — map `telemetry.breath` into UI state.
- `apps/web/src/styles` (or Tailwind classes) — styling for breath waveform/indicator.
- `tests/e2e` — add breath widget coverage.

### Notes
- Label the widget as "Synthetic breath" to reduce anthropomorphic framing.
- Animate a simple sine-wave or pulse using bpm and coherence.
- Show a fallback state when breath telemetry is missing.

## Test cases

### End-to-end tests
1. **TC-E2E-18:** Breath widget renders on Dashboard
   - Expected: widget visible with "Synthetic breath" label.

2. **TC-E2E-19:** Breath widget updates on Subject event
   - Expected: cadence/variability values update after a Subject turn.

### Regression tests
- `npx playwright test --headed`

## Acceptance criteria
- [ ] Breath widget renders and updates on Subject telemetry.
- [ ] UI clearly labels breath telemetry as synthetic.
- [ ] Diagnostics tab shows raw breath metrics (bpm, variability, coherence, phase, source).
