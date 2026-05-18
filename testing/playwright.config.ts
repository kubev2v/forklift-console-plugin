import { defineConfig, devices } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

/**
 * Console URL: prefer BRIDGE_BASE_ADDRESS when non-empty, else BASE_ADDRESS, else local default.
 * Empty / whitespace-only BRIDGE_BASE_ADDRESS is treated as unset so e2e env files can clear
 * a stale shell export (e.g. `BRIDGE_BASE_ADDRESS=` in a personal .env).
 */
const resolvePlaywrightBaseUrl = (): string => {
  const bridge = process.env.BRIDGE_BASE_ADDRESS?.trim();
  if (bridge) {
    return bridge;
  }
  const baseAddress = process.env.BASE_ADDRESS?.trim();
  if (baseAddress) {
    return baseAddress;
  }
  return 'http://localhost:9000';
};

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
        storageState:
          process.env.CLUSTER_USERNAME && process.env.CLUSTER_PASSWORD ? authFile : undefined,
        baseURL: resolvePlaywrightBaseUrl(),
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
