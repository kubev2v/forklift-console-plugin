import { existsSync, unlinkSync } from 'fs';

import { chromium, type FullConfig, type Page } from '@playwright/test';

import { LoginPage } from './page-objects/LoginPage';
import { ResourceFetcher } from './utils/resource-manager/ResourceFetcher';
import { disableGuidedTour } from './utils/utils';

const RESOURCES_FILE = 'playwright/.resources.json';
const VERSION_ENV_VAR = 'FORKLIFT_VERSION';

/**
 * Auto-detect the Forklift/MTV operator version from the cluster CSV.
 * Skips detection when FORKLIFT_VERSION is already set (manual override).
 */
const detectForkliftVersion = async (page: Page): Promise<void> => {
  const existing = process.env[VERSION_ENV_VAR];

  if (existing) {
    console.error(`📌 Using pre-set Forklift version: ${existing}`);
    return;
  }

  const detectedVersion = await ResourceFetcher.fetchMtvVersion(page);

  if (detectedVersion) {
    // eslint-disable-next-line require-atomic-updates -- single-threaded global setup, no actual race
    process.env[VERSION_ENV_VAR] = detectedVersion;
    console.error(`🔍 Auto-detected Forklift version: ${detectedVersion}`);
  } else {
    console.error('⚠️ Could not auto-detect Forklift version from cluster');
  }
};

const globalSetup = async (config: FullConfig) => {
  console.error('🚀 Starting global setup...');

  if (existsSync(RESOURCES_FILE)) {
    unlinkSync(RESOURCES_FILE);
  }

  const { baseURL, storageState } = config.projects[0].use;
  const username = process.env.CLUSTER_USERNAME;
  const password = process.env.CLUSTER_PASSWORD;

  if (!baseURL) {
    throw new Error('baseURL is not defined in the Playwright config');
  }

  if (username && password) {
    const browser = await chromium.launch();
    const page = await browser.newPage({ ignoreHTTPSErrors: true });

    // Listen to page errors
    page.on('pageerror', (error) => {
      console.error(`🚨 Page error: ${error.message}`);
    });

    await disableGuidedTour(page);

    try {
      const loginPage = new LoginPage(page);
      await loginPage.login(baseURL, username, password);

      await page.context().storageState({ path: storageState as string });
      console.error('✅ Authentication completed successfully');

      await detectForkliftVersion(page);
    } catch (error) {
      console.error('❌ Login failed in global setup:', error);
      throw error;
    } finally {
      await browser.close();
    }
  } else {
    console.error('⚠️ No credentials provided, skipping authentication setup');
    console.error(`📌 Forklift version: ${process.env[VERSION_ENV_VAR]}`);

    if (!process.env[VERSION_ENV_VAR]) {
      process.env[VERSION_ENV_VAR] = 'latest';
      console.error('📌 No credentials and no FORKLIFT_VERSION set, defaulting to "latest"');
    }
  }
};

export default globalSetup;
