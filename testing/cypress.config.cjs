/* eslint-env node */

import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 90_000,
  e2e: {
    baseUrl: process.env.BRIDGE_BASE_ADDRESS || process.env.BASE_ADDRESS,
    setupNodeEvents(on, config) {
      // Implement node event listeners here
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
});
