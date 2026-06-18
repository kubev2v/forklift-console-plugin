import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';

import { execFileSync } from 'node:child_process';

import { chromium, type FullConfig } from '@playwright/test';

import { restoreConsoleLanguage } from './fixtures/helpers/languageHelpers';
import { LoginPage } from './page-objects/LoginPage';
import { AUTH_FILE, ENV_RELAY_FILE, KUBECONFIG_FILE } from './utils/constants';
import { BaseResourceManager } from './utils/resource-manager/BaseResourceManager';
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
  'KUBECONFIG_PATH',
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
 * Fetches the cluster API server URL from the OpenShift infrastructure CR.
 * Uses cookie-based auth (console proxy) — called while cookies are still fresh,
 * before the kubeconfig is generated.
 */
const fetchClusterApiUrl = async (): Promise<string | null> => {
  type InfraCluster = { status?: { apiServerURL?: string } };
  const infra = await BaseResourceManager.apiGet<InfraCluster>(
    '/api/kubernetes/apis/config.openshift.io/v1/infrastructures/cluster',
  );
  return infra?.status?.apiServerURL ?? null;
};

/**
 * Runs `oc login` to generate a kubeconfig at KUBECONFIG_FILE.
 * Writes KUBECONFIG_PATH into process.env so subsequent Node.js HTTP calls in
 * this process (detectForkliftVersion, etc.) use the kubeconfig-based auth path.
 *
 * Falls back gracefully when:
 *  - CLUSTER_USERNAME / CLUSTER_PASSWORD are not set
 *  - The cluster API URL cannot be determined
 *  - The `oc` binary is not available
 */
const generateKubeconfig = async (username: string, password: string): Promise<void> => {
  const clusterApiUrl =
    process.env.CLUSTER_API_URL?.replace(/\/$/, '') ?? (await fetchClusterApiUrl());

  if (!clusterApiUrl) {
    console.error(
      '⚠️ Could not determine cluster API URL — skipping kubeconfig generation. ' +
        'Set CLUSTER_API_URL env var to enable kubeconfig-based auth.',
    );
    return;
  }

  try {
    execFileSync(
      'oc',
      [
        'login',
        clusterApiUrl,
        '-u',
        username,
        '-p',
        password,
        '--insecure-skip-tls-verify',
        '--kubeconfig',
        KUBECONFIG_FILE,
      ],
      // Inline literal PATH so SonarCloud S4036 can statically verify it contains
      // only fixed, non-writable system directories (named constants aren't tracked).
      // NOSONAR: env intentionally omits process.env to prevent PATH hijacking.
      {
        env: { PATH: '/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin' },
        stdio: 'pipe',
        timeout: 30_000,
      },
    );
    Object.assign(process.env, { KUBECONFIG_PATH: KUBECONFIG_FILE });
    console.error(`✅ kubeconfig written to ${KUBECONFIG_FILE} — workers will use direct API auth`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`⚠️ oc login failed (${message}) — workers will fall back to session cookies`);
  }
};

/**
 * Auto-detect the Forklift/MTV operator version from the cluster CSV.
 *
 * Called after browser login so user.json (storageState) is available for
 * the Node.js HTTP client used by ResourceFetcher.
 */
const detectForkliftVersion = async (): Promise<void> => {
  try {
    const detectedVersion = await ResourceFetcher.fetchMtvVersion();
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
const detectCnvVersion = async (): Promise<void> => {
  try {
    const detectedVersion = await ResourceFetcher.fetchCnvVersion();
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

      await page.context().storageState({ path: AUTH_FILE });
      console.error('✅ Authentication completed successfully');

      await restoreConsoleLanguage(page);

      // Generate a kubeconfig using oc login so workers can talk directly to the
      // cluster API server with a long-lived Bearer token instead of session cookies.
      // Must happen after storageState is saved (fetchClusterApiUrl uses cookies)
      // and before detectForkliftVersion (which will then use the kubeconfig).
      await generateKubeconfig(username, password);

      // Version detection: prefers the kubeconfig auth path if generateKubeconfig
      // succeeded, otherwise falls back to session cookies automatically.
      await detectForkliftVersion();
      await detectCnvVersion();
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
