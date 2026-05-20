import { existsSync, readFileSync } from 'fs';

import { defineConfig, devices } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

const ENV_RELAY_FILE = 'playwright/.env-relay.json';
if (existsSync(ENV_RELAY_FILE)) {
  const relay = JSON.parse(readFileSync(ENV_RELAY_FILE, 'utf8')) as Record<string, string>;
  for (const [key, value] of Object.entries(relay)) {
    if (value !== '') {
      process.env[key] = value;
    }
  }
}

export default defineConfig({
  globalSetup: './playwright/global.setup.ts',
  globalTeardown: './playwright/global.teardown.ts',
  testDir: './playwright/e2e',
  timeout: process.env.JENKINS ? 15 * 60_000 : 60_000,
  fullyParallel: true,
  workers: process.env.CI ? 1 : 3,

  retries: process.env.GITHUB_ACTIONS ? 3 : 0,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    actionTimeout: 15_000,
    navigationTimeout: 15_000,
  },

  expect: {
    timeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: existsSync(authFile) ? authFile : undefined,
        baseURL:
          process.env.BRIDGE_BASE_ADDRESS ?? process.env.BASE_ADDRESS ?? 'http://localhost:9000',
        headless: true,
        viewport: { width: 1920, height: 1080 },
        screenshot: 'only-on-failure',
        video: {
          mode: 'retain-on-failure',
          show: {
            actions: { position: 'top-right' },
          },
        },
        trace: 'retain-on-failure-and-retries',
        // Use data-testid to match actual rendered HTML
        testIdAttribute: 'data-testid',
        ignoreHTTPSErrors: true,
        javaScriptEnabled: true,
        acceptDownloads: true,
      },
    },
  ],
});
