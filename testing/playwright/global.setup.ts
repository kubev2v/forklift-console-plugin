import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';

import { chromium, type FullConfig, type Page } from '@playwright/test';

import { restoreConsoleLanguage } from './fixtures/helpers/languageHelpers';
import { LoginPage } from './page-objects/LoginPage';
import { AUTH_FILE, ENV_RELAY_FILE } from './utils/constants';
import { RESOURCES_FILE } from './utils/resource-manager/constants';
import { ResourceFetcher } from './utils/resource-manager/ResourceFetcher';
import { disableGuidedTour } from './utils/utils';
import { CNV_VERSION_ENV_VAR, VERSION_ENV_VAR } from './utils/version/constants';

const ENV_KEYS_TO_RELAY = [
  'BASE_ADDRESS',
  'BRIDGE_BASE_ADDRESS',
  'CNV_VERSION',
  'FORKLIFT_VERSION',
  'JENKINS',
  'LIGHTSPEED_INSTALLED',
  'VSPHERE_PROVIDER',
] as const;

/**
 * Keys that were present in process.env *before* playwright.config.ts loaded the relay.
 * Used to distinguish "user explicitly set this in e2e.env / shell" from "stale relay value".
 */
const USER_SET_KEYS = new Set(
  (process.env.PLAYWRIGHT_USER_SET_KEYS ?? '').split(',').filter(Boolean),
);

/**
 * Auto-detect the Forklift/MTV operator version from the cluster CSV.
 *
 * Always fetches from the cluster. If the user explicitly set FORKLIFT_VERSION in e2e.env / shell,
 * the detected value is discarded in favour of theirs (intentional override). This ensures a stale
 * relay value is never silently carried forward across runs.
 */
const detectForkliftVersion = async (page: Page): Promise<void> => {
  try {
    const detectedVersion = await ResourceFetcher.fetchMtvVersion(page);
    if (process.env[VERSION_ENV_VAR] && USER_SET_KEYS.has(VERSION_ENV_VAR)) {
      console.error(`📌 Using user-set Forklift version: ${process.env[VERSION_ENV_VAR]}`);
    } else if (detectedVersion) {
      process.env[VERSION_ENV_VAR] = detectedVersion;
      console.error(`🔍 Auto-detected Forklift version: ${detectedVersion}`);
    } else {
      console.error('⚠️ Could not auto-detect Forklift version from cluster');
    }
  } catch (error) {
    console.error('⚠️ Forklift version detection failed (version gating will be skipped):', error);
  }
};

/**
 * Auto-detect the CNV (OpenShift Virtualization) operator version from the cluster CSV.
 * When CNV_VERSION was explicitly set by the user in e2e.env / shell, respect it.
 * Unlike Forklift, CNV version is optional — tests run when it's unknown.
 */
const detectCnvVersion = async (page: Page): Promise<void> => {
  try {
    const detectedVersion = await ResourceFetcher.fetchCnvVersion(page);
    if (process.env[CNV_VERSION_ENV_VAR] && USER_SET_KEYS.has(CNV_VERSION_ENV_VAR)) {
      console.error(`📌 Using user-set CNV version: ${process.env[CNV_VERSION_ENV_VAR]}`);
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

  const { baseURL } = config.projects[0].use;
  const username = process.env.CLUSTER_USERNAME;
  const password = process.env.CLUSTER_PASSWORD;

  if (!baseURL) {
    throw new Error('baseURL is not defined in the Playwright config');
  }

  if (username && password) {
    mkdirSync('playwright/.auth', { recursive: true });

    const browser = await chromium.launch();
    const page = await browser.newPage({ ignoreHTTPSErrors: true });

    page.on('pageerror', (error) => {
      console.error(`🚨 Page error: ${error.message}`);
    });

    try {
      const loginPage = new LoginPage(page);
      await loginPage.login(baseURL, username, password);

      await disableGuidedTour(page);

      // Wait for the console SPA to finish initialising its Kubernetes proxy session.
      // The proxy authenticates via the session-token cookie, but that binding is
      // completed asynchronously after the OAuth redirect.  Sending the ConfigMap
      // PATCH before networkidle resolves causes a 403 ("system:anonymous").
      await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {
        // networkidle may never fire on very busy clusters — proceed anyway.
        console.error('⚠️ networkidle timed out before language restore; proceeding');
      });

      await restoreConsoleLanguage(page);

      await page.context().storageState({ path: AUTH_FILE });
      console.error('✅ Authentication completed successfully');

      await detectForkliftVersion(page);
      await detectCnvVersion(page);
    } catch (error) {
      const screenshotPath = 'playwright/test-results/global-setup-login-failure.png';
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
      console.error(`📸 Login failure screenshot: ${screenshotPath} (URL: ${page.url()})`);
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

  const relay = Object.fromEntries(ENV_KEYS_TO_RELAY.map((key) => [key, process.env[key] ?? '']));
  writeFileSync(ENV_RELAY_FILE, JSON.stringify(relay));
  console.error('📝 Env relay written for workers:', JSON.stringify(relay));
};

export default globalSetup;
