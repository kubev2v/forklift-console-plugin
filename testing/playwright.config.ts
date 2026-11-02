import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  expect: {
    // The plugin loads ~90 lazy chunks; a cold first render has been measured around 15s
    // under 4-worker load, so a 15s assertion budget makes page-load checks a coin flip.
    timeout: 25_000,
  },
  fullyParallel: true,
  globalSetup: './playwright/global.setup.ts',
  globalTeardown: './playwright/global.teardown.ts',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        acceptDownloads: true,
        baseURL:
          process.env.BRIDGE_BASE_ADDRESS ?? process.env.BASE_ADDRESS ?? 'http://localhost:9000',
        headless: true,
        ignoreHTTPSErrors: true,
        javaScriptEnabled: true,
        screenshot: 'only-on-failure',
        storageState: existsSync(authFile) ? authFile : undefined,
        // Use data-testid to match actual rendered HTML
        testIdAttribute: 'data-testid',
        trace: 'on-first-retry',
        video: {
          mode: 'on-first-retry',
          show: {
            actions: { position: 'top-right' },
          },
        },
        viewport: { height: 1080, width: 1920 },
      },
    },
  ],
  reporter: [
    // printFailuresInline keeps failure causes visible even if a CI run is interrupted
    // or times out mid-suite before the end-of-run report is written.
    ['list', { printFailuresInline: true }],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    // Machine-readable digest (failures.md/json + timings.json) for agents and CI annotations.
    // Absolute path: Playwright resolves relative reporter paths from its own module directory.
    [join(__dirname, 'playwright/reporters/failureDigestReporter.ts')],
  ],

  // Two retries still absorb one flake while capping failure amplification at 3 attempts.
  retries: process.env.CI ? 2 : 0,

  testDir: './playwright/e2e',

  // Collapsed table specs run four viewport steps (modal + reload each) in one test:
  // measured p50 23s, p95 55s, max 62s. A 60s ceiling made those a coin flip, so the
  // timeout has to cover the work the test actually does.
  timeout: process.env.JENKINS ? 15 * 60_000 : 120_000,

  use: {
    actionTimeout: 15_000,
    navigationTimeout: 15_000,
  },

  // 4 workers finished in 836s vs 969s at 3, but the 4-vCPU runner also hosts the kind
  // cluster (console, forklift, kubevirt) and a rotating set of timing assertions flaked
  // under that load. 3 workers trades ~2 minutes for a stable run.
  workers: 3,
});
