import { test, expect } from '@playwright/test';
import { installTelegramStub } from './telegram';
import { installStreamStub } from './streamStub';

test('guided questions queue a predefined prompt', async ({ page }) => {
  await installTelegramStub(page, 'test-init-data');
  await installStreamStub(page, []);

  await page.route('**/api/auth/init', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        userId: 'user-1',
        consented: true,
        isOperator: false,
        preferences: { ui_locale: 'en', ui_theme: 'light' }
      })
    });
  });

  await page.route('**/api/guided-questions', async (route, request) => {
    const payload = JSON.parse(request.postData() || '{}') as { questionId?: string };
    expect(payload.questionId).toBe('self-awareness.presence');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, guidanceId: 'guide-1' })
    });
  });
  await page.route('**/api/guided-questions/status', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, remaining: 3, is_unlimited: false })
    });
  });

  await page.goto('/');

  await expect(page.getByText('Guided questions', { exact: true })).toBeVisible();
  await expect(page.getByText('Remaining 3', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'What do you notice about yourself right now that surprises you?' })
    .click();

  await expect(page.getByText('Guided question queued.')).toBeVisible();
});
