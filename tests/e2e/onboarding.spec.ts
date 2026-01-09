import { test, expect } from '@playwright/test';
import { installTelegramStub } from './telegram';

test('shows dashboard layout', async ({ page }) => {
  await installTelegramStub(page);
  await page.goto('/');
  await expect(page.getByText('Noetic Mirror')).toBeVisible();
  await expect(page.getByText('Live Research Loop')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logs' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Stars', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'About', exact: true })).toBeVisible();
});
