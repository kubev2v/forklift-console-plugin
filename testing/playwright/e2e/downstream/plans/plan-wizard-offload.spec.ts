import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import {
  createPlanTestData,
  OffloadPluginK8sValues,
  OffloadPlugins,
  OffloadSecrets,
  StorageProductK8sValues,
  StorageProducts,
} from '../../../types/test-data';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V2_11_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe(
  'Storage Offloading - Plan Wizard with Offload + Review',
  { tag: '@downstream' },
  () => {
    requireVersion(test, V2_11_0);

    test('should configure offload in plan wizard and display it correctly in review', async ({
      page,
      resourceManager,
      testProvider,
    }) => {
      if (!testProvider) throw new Error('testProvider is required');

      const planName = `offload-test-${crypto.randomUUID().slice(0, 8)}`;
      const testPlanData = createPlanTestData({
        planName,
        sourceProvider: testProvider.metadata.name,
        targetProject: { name: 'default', isPreexisting: true },
        storageMap: {
          name: `${planName}-storage-map`,
          isPreexisting: false,
        },
      });

      const wizard = new CreatePlanWizardPage(page, resourceManager);

      await test.step('Navigate to Storage Map step', async () => {
        await wizard.navigate();
        await wizard.navigateToStorageMapStep(testPlanData);
      });

      await test.step('Verify offload options visible on Storage Map step', async () => {
        await wizard.storageMap.verifyStepVisible();
        await wizard.storageMap.waitForData();

        await wizard.storageMap.useNewStorageMapRadio.check();

        await wizard.storageMap.offload.verifyOffloadToggleVisible(0);
      });

      await test.step('Configure offload options', async () => {
        await wizard.storageMap.offload.expandOffloadOptions(0);
        await wizard.storageMap.offload.verifyAllDropdownsVisible(0);

        await wizard.storageMap.offload.selectOffloadPlugin(0, OffloadPlugins.VSPHERE_XCOPY);
        await wizard.storageMap.offload.selectStorageSecret(0, OffloadSecrets.VS8_SECRET);
        await wizard.storageMap.offload.selectStorageProduct(0, StorageProducts.NETAPP_ONTAP);
      });

      await test.step('Proceed past Storage Map and skip to review', async () => {
        await wizard.clickNext();
        await wizard.clickSkipToReview();
      });

      await test.step('Verify offload details in review', async () => {
        await wizard.review.verifyStepVisible();

        await expect(wizard.review.storageMapSection).toBeVisible();

        await wizard.review.verifyStorageMapOffloadDetails(0, {
          offloadPlugin: OffloadPluginK8sValues.VSPHERE_XCOPY,
          storageProduct: StorageProductK8sValues.NETAPP_ONTAP,
          storageSecret: OffloadSecrets.VS8_SECRET,
        });
      });

      await test.step('Create plan and register for cleanup', async () => {
        await wizard.clickNext();
        await wizard.waitForPlanCreation();
        resourceManager.addPlan(planName, MTV_NAMESPACE);
      });
    });
  },
);
