import assert from 'node:assert/strict';
import test from 'node:test';
import { computeTelemetry } from './metrics.js';

test('computeTelemetry includes breath only when enabled', () => {
  const baseline = computeTelemetry('I observe the loop.', 800);
  assert.equal(baseline.breath, undefined);

  const withBreath = computeTelemetry('I observe the loop.', 800, {
    breath: { enabled: true }
  });
  assert.ok(withBreath.breath);
  assert.ok(withBreath.breath?.bpm && withBreath.breath?.bpm >= 6 && withBreath.breath?.bpm <= 24);
});

test('computeTelemetry breath metrics stay within bounds', () => {
  const withBreath = computeTelemetry('Pause... then release.', 1400, {
    breath: { enabled: true }
  });

  assert.ok(withBreath.breath);
  assert.ok(withBreath.breath?.variability >= 0 && withBreath.breath?.variability <= 1);
  assert.ok(withBreath.breath?.coherence >= 0 && withBreath.breath?.coherence <= 1);
});
