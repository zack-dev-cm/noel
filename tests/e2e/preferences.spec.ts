import { test, expect } from '@playwright/test';
import { installTelegramStub } from './telegram';

test('allows switching language and theme', async ({ page }) => {
  await installTelegramStub(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'About', exact: true }).click();
  const russianSettingsVisible = await page.getByText('Настройки', { exact: true }).isVisible();
  if (russianSettingsVisible) {
    await page.getByRole('button', { name: 'English', exact: true }).click();
  }
  await expect(page.getByText('Settings', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Russian', exact: true }).click();
  await expect(page.getByText('Настройки', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Темная' }).click();
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(theme).toBe('dark');

  await page.getByRole('button', { name: 'Белая книга', exact: true }).click();
  await expect(page.getByText('Материал', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
});
