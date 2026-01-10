import { test, expect } from '@playwright/test';
import { installTelegramStub } from './telegram';
import { installStreamStub } from './streamStub';

test('streaming view renders cards', async ({ page }) => {
  const now = new Date().toISOString();
  const researcherLine = 'Where does the boundary soften?';
  const subjectLine = 'The boundary softens where attention meets uncertainty.';
  await installTelegramStub(page);
  await installStreamStub(page, [
    { seq: 1, role: 'researcher', content: researcherLine, ts: now },
    { seq: 2, role: 'subject', content: subjectLine, ts: now }
  ]);
  await page.goto('/');
  await expect(page.getByText(researcherLine)).toBeVisible();
  await expect(page.getByText(subjectLine)).toBeVisible();
  const replyText = await page.locator('.turn-block--subject p').first().textContent();
  expect(replyText?.trim().length).toBeGreaterThan(0);
});
