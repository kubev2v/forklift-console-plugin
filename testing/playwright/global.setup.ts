import { existsSync, unlinkSync } from 'fs';

import { chromium, type FullConfig, type Page } from '@playwright/test';

import { LoginPage } from './page-objects/LoginPage';
import { ResourceFetcher } from './utils/resource-manager/ResourceFetcher';
import { disableGuidedTour } from './utils/utils';
import { CNV_VERSION_ENV_VAR, VERSION_ENV_VAR } from './utils/version/constants';

const RESOURCES_FILE = 'playwright/.resources.json';

/**
 * Auto-detect the Forklift/MTV operator version from the cluster CSV.
 * When FORKLIFT_VERSION is already set (manual override), the pre-set value wins.
 */
const detectForkliftVersion = async (page: Page): Promise<void> => {
  const detectedVersion = await ResourceFetcher.fetchMtvVersion(page);

  const existing = process.env[VERSION_ENV_VAR];
  if (existing) {
    console.error(`📌 Using pre-set Forklift version: ${existing}`);
  } else if (detectedVersion) {
    process.env[VERSION_ENV_VAR] = detectedVersion;
    console.error(`🔍 Auto-detected Forklift version: ${detectedVersion}`);
  } else {
    console.error('⚠️ Could not auto-detect Forklift version from cluster');
  }
};

/**
 * Auto-detect the CNV (OpenShift Virtualization) operator version from the cluster CSV.
 * When CNV_VERSION is already set (manual override), the pre-set value wins.
 * Unlike Forklift, CNV version is optional — tests run when it's unknown.
 */
const detectCnvVersion = async (page: Page): Promise<void> => {
  try {
    const detectedVersion = await ResourceFetcher.fetchCnvVersion(page);

    const existing = process.env[CNV_VERSION_ENV_VAR];
    if (existing) {
      console.error(`📌 Using pre-set CNV version: ${existing}`);
    } else if (detectedVersion) {
      process.env[CNV_VERSION_ENV_VAR] = detectedVersion;
      console.error(`🔍 Auto-detected CNV version: ${detectedVersion}`);
    } else {
      console.error(
        '⚠️ Could not auto-detect CNV version from cluster (CNV gating will be skipped)',
      );
    }
  } catch (error) {
    console.error('⚠️ CNV version detection failed (CNV gating will be skipped):', error);
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
      await detectCnvVersion(page);
    } catch (error) {
      console.error('❌ Login failed in global setup:', error);
      throw error;
    } finally {
      await browser.close();
    }
  } else {
    console.error('⚠️ No credentials provided, skipping authentication setup');

    const browser = await chromium.launch();
    const page = await browser.newPage({ ignoreHTTPSErrors: true });

    try {
      await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 10_000 });
      await detectForkliftVersion(page);
      await detectCnvVersion(page);
    } catch {
      console.error('⚠️ Could not reach cluster for version detection, using env vars/defaults');
    } finally {
      await browser.close();
    }

    if (!process.env[VERSION_ENV_VAR]) {
      process.env[VERSION_ENV_VAR] = 'latest';
      console.error('📌 No credentials and no FORKLIFT_VERSION set, defaulting to "latest"');
    }
  }
};

export default globalSetup;
