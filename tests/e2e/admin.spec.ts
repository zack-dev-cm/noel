import { test, expect } from '@playwright/test';
import { installTelegramStub } from './telegram';

test('shows model versions in admin panel', async ({ page }) => {
  await installTelegramStub(page, 'test-init-data');

  await page.route('**/api/auth/init', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ consented: true, userId: 'user-1', isOperator: true })
    });
  });

  await page.route('**/api/admin/settings', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fulfill({
        status: 405,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        settings: { token_saver_enabled: false, updated_at: '2025-01-01T00:00:00Z' },
        model_versions: {
          researcher: 'gpt-5.2-2025-12-11',
          subject: 'gemini-3-pro-preview',
          subject_fallback: 'gemini-flash-latest'
        }
      })
    });
  });

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Admin' })).toBeVisible();
  await page.getByRole('button', { name: 'Admin' }).dispatchEvent('click');
  await expect(page.getByText('Model versions')).toBeVisible();
  await expect(page.getByText('gpt-5.2-2025-12-11')).toBeVisible();
  await expect(page.getByText('gemini-3-pro-preview')).toBeVisible();
  await expect(page.getByText('gemini-flash-latest')).toBeVisible();
});
