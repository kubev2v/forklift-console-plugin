import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

import {
  restoreConsoleLanguage,
  setConsoleLanguage,
  type SupportedLanguage,
} from '../../fixtures/helpers/languageHelpers';
import { NavigationHelper } from '../../utils/NavigationHelper';
import { disableGuidedTour } from '../../utils/utils';
import { V2_12_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const LOCALE_NAMESPACE = 'plugin__forklift-console-plugin';

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

const TESTED_LANGUAGES: SupportedLanguage[] = ['ja', 'zh'];

const missingKeyPattern = (language: string): RegExp =>
  new RegExp(`Missing i18n key .+ in namespace "${LOCALE_NAMESPACE}" and language "${language}"`);

test.describe('i18n — translations smoke test', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async ({ browser }) => {
    const authFile =
      process.env.CLUSTER_USERNAME && process.env.CLUSTER_PASSWORD
        ? 'playwright/.auth/user.json'
        : undefined;
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      storageState: authFile,
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await restoreConsoleLanguage(page);
    await context.close();
  });

  for (const lang of TESTED_LANGUAGES) {
    test(`locale files load and render correctly in ${lang}`, async ({ page }) => {
      const locale = loadLocale(lang);
      const navigation = new NavigationHelper(page);
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await test.step('Set language via API then navigate to overview', async () => {
        await navigation.navigateToConsole();
        await setConsoleLanguage(page, lang);
        await navigation.navigateToOverview();
        await disableGuidedTour(page);
      });

      await test.step('Verify Overview page translations', async () => {
        await page.waitForSelector('h1', { timeout: 15_000 });

        const welcomeHeading = page.getByRole('heading', { name: locale.Welcome });
        await expect(welcomeHeading).toBeVisible({ timeout: 10_000 });

        const createPlanButton = page.getByRole('button', {
          name: locale['Create migration plan'],
        });
        await expect(createPlanButton).toBeVisible();
      });

      await test.step('Verify Providers page translations', async () => {
        await navigation.navigateToK8sResource({
          allNamespaces: true,
          resource: 'Provider',
        });
        await page.waitForSelector('h1', { timeout: 15_000 });

        const createButton = page.getByRole('button', {
          name: locale['Create provider'],
        });
        await expect(createButton).toBeVisible({ timeout: 10_000 });
      });

      await test.step('No unexpected missing i18n keys for forklift plugin', () => {
        const pattern = missingKeyPattern(lang);
        const forkliftMissingKeys = consoleErrors.filter((e) => pattern.test(e));
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
