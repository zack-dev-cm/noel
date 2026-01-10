import { test, expect } from '@playwright/test';
import { installTelegramStub } from './telegram';
import { installStreamStub } from './streamStub';

test('renders stub stream content', async ({ page }) => {
  const now = new Date().toISOString();
  const researcherLine = 'What feels most alive right now?';
  const subjectLine = 'A warm stillness and a narrowing focus.';
  await installTelegramStub(page);
  await installStreamStub(page, [
    { seq: 1, role: 'researcher', content: researcherLine, ts: now },
    { seq: 2, role: 'subject', content: subjectLine, ts: now }
  ]);
  await page.goto('/');
  await expect(page.getByText(researcherLine)).toBeVisible();
  await expect(page.getByText(subjectLine)).toBeVisible();
});
