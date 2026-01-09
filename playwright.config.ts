import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    headless: false,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  retries: 0,
  timeout: 60_000
});
