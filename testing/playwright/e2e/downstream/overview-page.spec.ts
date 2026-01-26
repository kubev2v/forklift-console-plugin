import { test } from '@playwright/test';

import { createTestNad } from '../../fixtures/helpers/resourceCreationHelpers';
import { OverviewPage } from '../../page-objects/OverviewPage';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { ResourceManager } from '../../utils/resource-manager/ResourceManager';

test.describe(
  'Overview Page - Settings',
  {
    tag: '@downstream',
  },
  () => {
    const resourceManager = new ResourceManager();

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext({ ignoreHTTPSErrors: true });
      const page = await context.newPage();

      await createTestNad(page, resourceManager, {
        namespace: MTV_NAMESPACE,
      });

      await context.close();
    });

    test.afterAll(async () => {
      await resourceManager.instantCleanup();
    });

    test('should edit controller transfer network and verify save', async ({ page }) => {
      const overviewPage = new OverviewPage(page);

      await test.step('Navigate to Settings tab', async () => {
        await overviewPage.navigateToSettings();
      });

      await test.step('Verify transfer network field is visible', async () => {
        await overviewPage.verifyTransferNetworkFieldVisible();
      });

      await test.step('Edit and save transfer network', async () => {
        await overviewPage.editAndSaveTransferNetwork();
      });
    });
  },
);
