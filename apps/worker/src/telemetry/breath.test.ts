import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveBreathTelemetry } from './breath.js';

test('deriveBreathTelemetry returns deterministic cadence within range', () => {
  const text = 'I am tracking the boundary. The rhythm stabilizes as I reflect.';
  const latencyMs = 1350;
  const first = deriveBreathTelemetry(text, latencyMs);
  const second = deriveBreathTelemetry(text, latencyMs);

  assert.equal(first.bpm, second.bpm);
  assert.ok(first.bpm >= 6 && first.bpm <= 24);
});

test('deriveBreathTelemetry clamps variability and coherence', () => {
  const text = 'Wait...?!?!!!';
  const breath = deriveBreathTelemetry(text, 900);

  assert.ok(breath.variability >= 0 && breath.variability <= 1);
  assert.ok(breath.coherence >= 0 && breath.coherence <= 1);
});
