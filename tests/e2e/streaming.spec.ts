import { test, expect } from '@playwright/test';
import { installTelegramStub } from './telegram';
import { installStreamStub } from './streamStub';

test('streaming view renders cards', async ({ page }) => {
  const now = new Date().toISOString();
  const researcherLine = 'Where does the boundary soften?';
  const subjectLine = 'The boundary softens where attention meets uncertainty.';
  const seqBase = 91000;
  await installTelegramStub(page);
  await installStreamStub(page, [
    { seq: seqBase, role: 'researcher', content: researcherLine, ts: now, model_tag: 'GPT-5.2' },
    { seq: seqBase + 1, role: 'subject', content: subjectLine, ts: now, model_tag: 'Gemini 3' }
  ]);
  await page.goto('/');
  const card = page.locator('.turn-card', { hasText: researcherLine });
  await expect(card).toBeVisible();
  await expect(card.getByText(researcherLine)).toBeVisible();
  await expect(card.getByText(subjectLine)).toBeVisible();
  const replyText = await page.locator('.turn-block--subject p').first().textContent();
  expect(replyText?.trim().length).toBeGreaterThan(0);
  await expect(card.locator('.turn-block--researcher .turn-tag', { hasText: 'GPT-5.2' })).toBeVisible();
  await expect(card.locator('.turn-block--subject .turn-tag', { hasText: 'Gemini 3' })).toBeVisible();
});

test('logs expand on tap and show full text', async ({ page }) => {
  const now = new Date().toISOString();
  const researcherLine = 'What signal drifts the most?';
  const subjectLine =
    'The drift shows up in the way attention lingers on uncertain edges. It feels like a low hum in the background. When the loop tightens, the hum narrows into a single track. I can still sense residual noise between turns.';
  const seqBase = 92000;
  await installTelegramStub(page);
  await installStreamStub(page, [
    { seq: seqBase, role: 'researcher', content: researcherLine, ts: now, model_tag: 'GPT-5.2' },
    { seq: seqBase + 1, role: 'subject', content: subjectLine, ts: now, model_tag: 'Gemini 3' }
  ]);
  await page.goto('/');
  await page.getByRole('button', { name: /Logs|Логи/ }).click();
  const card = page.locator('.turn-card', { hasText: researcherLine }).first();
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator('.turn-tag', { hasText: 'GPT-5.2' })).toBeVisible();
  await expect(card).toHaveClass(/turn-card--collapsed/);
  await card.click();
  await expect(card).not.toHaveClass(/turn-card--collapsed/);
  await expect(card.getByText(subjectLine)).toBeVisible();
});
