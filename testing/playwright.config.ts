import { defineConfig, devices } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

export default defineConfig({
  globalSetup: './playwright/global.setup.ts',
  globalTeardown: './playwright/global.teardown.ts',
  testDir: './playwright/e2e',
  timeout: process.env.JENKINS ? 15 * 60_000 : 60_000,
  fullyParallel: true,
  workers: 3,

  retries: process.env.GITHUB_ACTIONS ? 3 : 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    actionTimeout: 20_000,
    navigationTimeout: 20_000,
  },

  expect: {
    timeout: 20_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState:
          process.env.CLUSTER_USERNAME && process.env.CLUSTER_PASSWORD ? authFile : undefined,
        baseURL:
          process.env.BRIDGE_BASE_ADDRESS ?? process.env.BASE_ADDRESS ?? 'http://localhost:9000',
        headless: true,
        viewport: { width: 1920, height: 1080 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        // Use data-testid to match actual rendered HTML
        testIdAttribute: 'data-testid',
        ignoreHTTPSErrors: true,
        javaScriptEnabled: true,
        acceptDownloads: true,
      },
    },
  ],
});
