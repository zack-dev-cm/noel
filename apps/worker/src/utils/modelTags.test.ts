import assert from 'node:assert/strict';
import test from 'node:test';
import { formatModelTag } from '@noetic/shared';

test('formatModelTag shortens GPT model IDs', () => {
  assert.equal(formatModelTag('gpt-5.2-2025-12-11'), 'GPT-5.2');
  assert.equal(formatModelTag('gpt-4o-mini'), 'GPT-4o');
});

test('formatModelTag shortens Gemini model IDs', () => {
  assert.equal(formatModelTag('gemini-3-pro-preview'), 'Gemini 3');
  assert.equal(formatModelTag('gemini-flash-latest'), 'Gemini Flash');
});

test('formatModelTag returns null for empty input', () => {
  assert.equal(formatModelTag(''), null);
  assert.equal(formatModelTag(undefined), null);
});
