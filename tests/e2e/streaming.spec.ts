import { test, expect } from '@playwright/test';
import { installTelegramStub } from './telegram';

test('streaming view renders cards', async ({ page }) => {
  await installTelegramStub(page);
  await page.goto('/');
  await expect(page.getByText('Subject channel')).toBeVisible();
  await expect(page.getByText('Researcher channel')).toBeVisible();
});
