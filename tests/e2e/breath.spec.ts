import { test, expect } from '@playwright/test';
import { installTelegramStub } from './telegram';
import { installStreamStub } from './streamStub';

test('breath widget renders on dashboard', async ({ page }) => {
  await installTelegramStub(page);
  await page.goto('/');
  await expect(page.getByText('Synthetic breath')).toBeVisible();
});

test('breath widget updates on subject event', async ({ page }) => {
  await installTelegramStub(page);
  await installStreamStub(page, {
    seq: 1,
    role: 'subject',
    content: 'Subject: steady cadence.',
    ts: new Date().toISOString(),
    telemetry: {
      distress_score: 0.12,
      self_ref_rate: 0.21,
      uncertainty: 0.08,
      latency_ms: 1200,
      breath: {
        bpm: 14.5,
        variability: 0.34,
        coherence: 0.78,
        phase: 'inhale',
        source: 'derived'
      }
    }
  });
  await page.goto('/');

  await expect(page.getByTestId('breath-bpm')).toHaveText('14.5 bpm');
  await expect(page.getByTestId('breath-variability')).toHaveText('0.34');
  await expect(page.getByTestId('breath-coherence')).toHaveText('0.78');
  await expect(page.getByTestId('breath-phase')).toHaveText(/inhale|вдох/);
});
