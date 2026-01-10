import assert from 'node:assert/strict';
import test from 'node:test';
import { truncateText } from './text.js';

test('truncateText keeps full text when below limit', () => {
  const text = 'Two sentences stay intact.';
  assert.equal(truncateText(text, 120), text);
});

test('truncateText avoids overly short sentence cut', () => {
  const text = `Short. ${'x'.repeat(200)}`;
  const truncated = truncateText(text, 100);
  assert.ok(truncated.length >= 90);
  assert.ok(truncated.endsWith('…'));
});

test('truncateText prefers sentence boundary when long enough', () => {
  const text =
    'Sentence one is long enough to cross the minimum break threshold by adding extra detail and context with a few more descriptive clauses to stretch the length. Sentence two continues after that.';
  const truncated = truncateText(text, 160);
  assert.ok(truncated.includes('Sentence one'));
  assert.ok(!truncated.includes('Sentence two'));
  assert.ok(truncated.endsWith('…'));
});
