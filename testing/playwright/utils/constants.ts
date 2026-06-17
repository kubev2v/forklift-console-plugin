/**
 * Hardcoded auth file path — must match playwright.config.ts.
 * Never read this from config.projects[0].use.storageState: that value is computed by
 * existsSync() at config-evaluation time and will be `undefined` if the file was deleted
 * (e.g. by a previous failed run). Always writing to this constant path keeps the file
 * alive for config evaluation on the next run.
 */
export const AUTH_FILE = 'playwright/.auth/user.json';

/**
 * Kubeconfig file written by global.setup.ts after oc login succeeds.
 * Workers load this file via @kubernetes/client-node to authenticate directly
 * against the cluster API server (bypassing the OpenShift console proxy).
 * When absent, BaseResourceManager falls back to session cookies.
 */
export const KUBECONFIG_FILE = 'playwright/.auth/kubeconfig';

/**
 * Relay file written by global.setup.ts so playwright.config.ts (re-evaluated in each
 * worker) can restore env vars that Playwright workers do not inherit.
 * See https://github.com/microsoft/playwright/issues/21565
 */
export const ENV_RELAY_FILE = 'playwright/.env-relay.json';
