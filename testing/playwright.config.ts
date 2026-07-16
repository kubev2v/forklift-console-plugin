import { existsSync, readFileSync } from 'node:fs';

import { defineConfig, devices } from '@playwright/test';

import { AUTH_FILE as authFile, ENV_RELAY_FILE } from './playwright/utils/constants';

// Capture keys explicitly set by the user (shell / e2e.env) *before* the relay is loaded.
// global.setup.ts reads this list to decide whether a version was user-set vs stale-relay.
process.env.PLAYWRIGHT_USER_SET_KEYS = Object.keys(process.env).join(',');

if (existsSync(ENV_RELAY_FILE)) {
  const relay = JSON.parse(readFileSync(ENV_RELAY_FILE, 'utf8')) as Record<string, string>;
  for (const [key, value] of Object.entries(relay)) {
    // ??= semantics: shell / e2e.env values take priority over relay.
    // This prevents a stale relay from overwriting what the user explicitly exported.
    if (value !== '' && !process.env[key]) {
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
    // printFailuresInline keeps failure causes visible even if a CI run is interrupted
    // or times out mid-suite before the end-of-run report is written.
    ['list', { printFailuresInline: true }],
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
