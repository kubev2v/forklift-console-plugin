import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/e2e',
  timeout: 60_000,

  retries: process.env.GITHUB_ACTIONS ? 3 : 0,

  use: {
    // GitHub Actions uses port 30080, local dev uses 9000
    baseURL: process.env.BRIDGE_BASE_ADDRESS ?? process.env.BASE_ADDRESS ?? 'http://localhost:9000',
    headless: true,
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Use data-testid to match actual rendered HTML
    testIdAttribute: 'data-testid',
  },
});
