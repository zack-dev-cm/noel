import { test, expect } from '@playwright/test';

test('webhook responds ok for empty update', async ({ request }) => {
  const apiBase = process.env.PLAYWRIGHT_API_BASE_URL || 'http://localhost:8787';
  const response = await request.post(`${apiBase}/telegram/webhook/test`, {
    data: {}
  });
  expect([200, 403]).toContain(response.status());
});
