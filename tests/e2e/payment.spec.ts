import { test, expect } from '@playwright/test';

test('invoice endpoint rejects invalid initData', async ({ request }) => {
  const apiBase = process.env.PLAYWRIGHT_API_BASE_URL || 'http://localhost:8787';
  const response = await request.post(`${apiBase}/api/payments/invoice`, {
    data: { type: 'cosmic_patron', initData: 'invalid' }
  });
  expect([400, 401, 500]).toContain(response.status());
});
