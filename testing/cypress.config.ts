/* eslint-env node */

import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 90_000,
  e2e: {
    baseUrl: process.env.BRIDGE_BASE_ADDRESS ?? process.env.BASE_ADDRESS ?? 'http://localhost:9000',
    supportFile: 'cypress/support/index.ts',
    chromeWebSecurity: false,
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      // Enable JavaScript and configure browser settings
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--enable-javascript');
          launchOptions.args.push('--js-flags=--expose-gc');
          launchOptions.args.push('--enable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
        }
        return launchOptions;
      });
    },
  },
  screenshotOnRunFailure: true,
  screenshotsFolder: '/tmp/gui-test-screenshots/screenshots/',
  trashAssetsBeforeRuns: true,
  video: true,
  videosFolder: '/tmp/gui-test-screenshots/videos/',
  viewportHeight: 1080,
  viewportWidth: 1920,
  waitForAnimations: true,
  watchForFileChanges: false,
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 5,
});
