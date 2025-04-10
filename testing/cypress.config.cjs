/* eslint-env node */

import { defineConfig } from "cypress";

export default defineConfig({
  defaultCommandTimeout: 90_000,
  e2e: {
    baseUrl: process.env.BRIDGE_BASE_ADDRESS || process.env.BASE_ADDRESS,
    injectDocumentDomain: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  screenshotOnRunFailure: true,
  screenshotsFolder: "/tmp/gui-test-screenshots/screenshots/",
  trashAssetsBeforeRuns: true,
  video: true,
  videosFolder: "/tmp/gui-test-screenshots/videos/",
  viewportHeight: 1080,
  viewportWidth: 1920,
  waitForAnimations: true,
  watchForFileChanges: false,
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 10_000,
  experimentalSessionAndOrigin: true,
});
