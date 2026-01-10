import { test, expect } from '@playwright/test';
import { installTelegramStub } from './telegram';

test('shows dashboard layout', async ({ page }) => {
  await installTelegramStub(page);
  await page.goto('/');
  const nav = page.locator('.tab-bar');
  await expect(page.getByText('Noetic Mirror')).toBeVisible();
  await expect(page.getByText(/Live session|Прямая сессия/)).toBeVisible();
  await expect(nav.getByRole('button', { name: /Live|Эфир/ })).toBeVisible();
  await expect(nav.getByRole('button', { name: /Logs|Логи/ })).toBeVisible();
  await expect(nav.getByRole('button', { name: /Stars|Звезды/ })).toBeVisible();
  await expect(nav.getByRole('button', { name: /About|О проекте/ })).toBeVisible();
});
