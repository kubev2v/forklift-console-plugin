import { expect } from '@playwright/test';

import { setupPlanDetailsPage } from '../../../fixtures/helpers/planDetailsHelpers';
import {
  injectConversionResumable,
  type PlanCondition,
  restorePlanConditions,
} from '../../../fixtures/helpers/planResumeConversion';
import { sharedProviderFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlanResumeConversion } from '../../../page-objects/PlanDetailsPage/PlanResumeConversion';
import { K8S_RECONCILE_TIMEOUT } from '../../../utils/resource-manager/constants';
import { V5_0_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

type ResumeMigrationBody = {
  metadata?: { generateName?: string };
  spec?: { resumeConversion?: boolean };
};

test.describe('Plan Resume Conversion (MTV-6248)', { tag: '@downstream' }, () => {
  requireVersion(test, V5_0_0);

  test('should gate Resume conversion on ConversionResumable and submit resumeConversion', async ({
    page,
    resourceManager,
    testPlan,
    testProvider: _testProvider,
  }) => {
    test.setTimeout(180_000);

    const { namespace, planDetailsPage, planName } = await setupPlanDetailsPage(page, testPlan);
    const resumeConversion = new PlanResumeConversion(page);
    let originalConditions: PlanCondition[] | undefined;

    try {
      await test.step('Resume conversion is visible and disabled without ConversionResumable', async () => {
        await resumeConversion.openActionsMenu();
        await expect(resumeConversion.menuItem).toBeVisible();
        await resumeConversion.expectMenuItemDisabled();
        await expect(resumeConversion.menuItem).toContainText('Resume conversion');
        await expect(resumeConversion.menuItem).toContainText(
          'Re-run conversion using previously copied disks',
        );
        await resumeConversion.closeActionsMenu();
        await expect(resumeConversion.statusButton).toBeHidden();
      });

      originalConditions =
        await test.step('Inject ConversionResumable on Plan status', async () => {
          return injectConversionResumable(resourceManager, planName, namespace);
        });

      await test.step('Resume link and Actions item enable after ConversionResumable', async () => {
        await planDetailsPage.navigate(planName, namespace);
        await expect(resumeConversion.statusButton).toBeVisible({ timeout: K8S_RECONCILE_TIMEOUT });
        await resumeConversion.openActionsMenu();
        await resumeConversion.expectMenuItemEnabled();
        await resumeConversion.closeActionsMenu();
      });

      let createBody: ResumeMigrationBody | undefined;

      await test.step('Open Resume conversion modal and POST resumeConversion without creating a Migration', async () => {
        await page.route(
          /\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/[^/]+\/migrations\/?$/u,
          async (route): Promise<void> => {
            if (route.request().method() !== 'POST') {
              await route.continue();
              return;
            }

            createBody = JSON.parse(route.request().postData() ?? '{}') as ResumeMigrationBody;
            await route.fulfill({
              body: JSON.stringify(createBody),
              contentType: 'application/json',
              status: 201,
            });
          },
        );

        await resumeConversion.openModalFromStatus();
        await expect(resumeConversion.modal).toContainText(
          `Resume conversion for plan ${planName}?`,
        );
        await expect(resumeConversion.modal).toContainText(
          'VM with copied disks will be processed',
        );
        await expect(resumeConversion.modal).toContainText('Disk copy will be skipped');
        await expect(resumeConversion.modalConfirmButton).toHaveText('Resume');

        await resumeConversion.modalConfirmButton.click();
        await expect(resumeConversion.modal).not.toBeVisible();
      });

      await test.step('Verify Migration payload sets resumeConversion', () => {
        expect(createBody?.spec?.resumeConversion).toBe(true);
        expect(createBody?.metadata?.generateName).toBe(`${planName}-resume-`);
      });
    } finally {
      if (originalConditions) {
        await restorePlanConditions(resourceManager, planName, namespace, originalConditions);
      }
    }
  });
});
