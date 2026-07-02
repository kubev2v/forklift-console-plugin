import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

import {
  restoreConsoleLanguage,
  setConsoleLanguage,
  type SupportedLanguage,
} from '../../fixtures/helpers/languageHelpers';
import { AUTH_FILE } from '../../utils/constants';
import { NavigationHelper } from '../../utils/NavigationHelper';
import { V2_12_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const LOCALE_NAMESPACE = 'plugin__forklift-console-plugin';
const PAGE_LOAD_TIMEOUT_MS = 15_000;
const ELEMENT_VISIBLE_TIMEOUT_MS = 10_000;
// Locale files are fetched asynchronously after the page's load event. On slow
// clusters the network request can outlast PAGE_LOAD_TIMEOUT_MS, so we give the
// translations extra time to arrive before asserting on the WelcomeCard heading.
const LOCALE_LOAD_TIMEOUT_MS = 30_000;

const LOCALE_SEARCH_PATHS = [
  resolve(__dirname, '../../../../locales'),
  resolve(__dirname, '../../../locales'),
];

const resolveLocalesDir = (): string => {
  const found = LOCALE_SEARCH_PATHS.find((dir) => existsSync(dir));
  if (!found) {
    throw new Error(
      `Locale files not found. Searched:\n${LOCALE_SEARCH_PATHS.join('\n')}\n` +
        'CI images must copy locales/ into testing/locales/.',
    );
  }
  return found;
};

const loadLocale = (lang: string): Record<string, string> => {
  const localesDir = resolveLocalesDir();
  const filePath = resolve(localesDir, lang, `${LOCALE_NAMESPACE}.json`);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
};

const TESTED_LANGUAGES: SupportedLanguage[] = ['es', 'fr', 'ja', 'ko', 'zh'];

const missingKeyPattern = (language: string): RegExp =>
  new RegExp(`Missing i18n key .+ in namespace "${LOCALE_NAMESPACE}" and language "${language}"`);

test.describe('i18n — translations smoke test', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      storageState: existsSync(AUTH_FILE) ? AUTH_FILE : undefined,
    });
    const page = await context.newPage();
    await page.goto('/');
    // Wait for console SPA to initialize its auth token before patching the ConfigMap.
    // domcontentloaded fires for the HTML shell; the auth token is loaded asynchronously.
    // Waiting for networkidle gives the console time to complete auth initialization.
    // Add a catch so this never hangs forever on a very busy cluster.
    await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {
      // networkidle may never fire on very busy clusters — proceed anyway.
    });
    await restoreConsoleLanguage(page);
    await context.close();
  });

  for (const lang of TESTED_LANGUAGES) {
    test(`locale files load and render correctly in ${lang}`, async ({ page }) => {
      const locale = loadLocale(lang);
      const navigation = new NavigationHelper(page);
      const allConsoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          allConsoleErrors.push(msg.text());
        }
      });

      await test.step('Set language via API then navigate to overview', async () => {
        await navigation.navigateToConsole();
        await setConsoleLanguage(page, lang);
        await navigation.navigateToOverview();
        // The plugin namespace locale file (e.g. plugin__forklift-console-plugin/es)
        // is fetched asynchronously after the load event. Wait for network requests to
        // settle so that useTranslation has received the file before we assert on
        // component text. Catch is required — on very busy clusters networkidle may
        // never fire (Kubernetes watch streams keep the connection alive).
        await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
      });

      await test.step('Verify Overview page translations', async () => {
        await page.waitForSelector('h1', { timeout: PAGE_LOAD_TIMEOUT_MS });

        const welcomeHeading = page.getByRole('heading', { name: locale.Welcome });
        await expect(welcomeHeading).toBeVisible({ timeout: LOCALE_LOAD_TIMEOUT_MS });

        // Scope to .forklift-title (project-specific CardTitle class) to avoid
        // matching the nav sidebar item or any table row containing this text.
        const mainContent = page.locator('main');
        const migrationPlansCard = mainContent.locator('.forklift-title', {
          hasText: locale['Migration plans'],
        });
        await expect(migrationPlansCard).toBeVisible({ timeout: ELEMENT_VISIBLE_TIMEOUT_MS });
      });

      await test.step('Verify Providers page translations', async () => {
        await navigation.navigateToK8sResource({
          allNamespaces: true,
          resource: 'Provider',
        });
        await page.waitForSelector('h1', { timeout: PAGE_LOAD_TIMEOUT_MS });

        // The toolbar button (add-provider-button) has been stable since 2023 and is always
        // rendered by StandardPage regardless of whether providers exist. Using the testId
        // avoids any ambiguity with the empty-state button; toContainText() is the actual
        // i18n assertion — it verifies the translated label, not just element presence.
        const createButton = page.getByTestId('add-provider-button');
        await expect(createButton).toBeVisible({ timeout: ELEMENT_VISIBLE_TIMEOUT_MS });
        await expect(createButton).toContainText(locale['Create provider']);
      });

      await test.step('No unexpected missing i18n keys for forklift plugin', () => {
        const pattern = missingKeyPattern(lang);
        const forkliftMissingKeys = allConsoleErrors.filter((e) => pattern.test(e));
        const KNOWN_MISSING_KEYS = ['Source'];
        const unexpected = forkliftMissingKeys.filter(
          (e) => !KNOWN_MISSING_KEYS.some((key) => e.includes(`"${key}"`)),
        );

        expect(unexpected, `Unexpected missing i18n keys:\n${unexpected.join('\n')}`).toHaveLength(
          0,
        );
      });
    });
  }
});
