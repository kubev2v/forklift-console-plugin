import { expect } from '@playwright/test';

import {
  providerOnlyFixtures,
  sharedProviderFixtures,
  sharedProviderStorageMapFixtures,
} from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { StorageMapCreatePage } from '../../../page-objects/StorageMapCreatePage';
import { StorageMapDetailsPage } from '../../../page-objects/StorageMapDetailsPage';
import { StorageMapsListPage } from '../../../page-objects/StorageMapsListPage';
import { createPlanTestData } from '../../../types/test-data';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V5_0_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

providerOnlyFixtures.describe('Access Mode - Create Storage Map', { tag: '@downstream' }, () => {
  requireVersion(providerOnlyFixtures, V5_0_0);

  providerOnlyFixtures(
    'should create storage map with access mode selection',
    async ({ page, resourceManager, testProvider }) => {
      if (!testProvider) {
        throw new Error('testProvider is required');
      }

      const storageMapName = `access-mode-sm-${crypto.randomUUID().slice(0, 8)}`;
      const listPage = new StorageMapsListPage(page);
      const createPage = new StorageMapCreatePage(page);
      const detailsPage = new StorageMapDetailsPage(page);

      await providerOnlyFixtures.step('Navigate to Create Storage Map form', async () => {
        await listPage.navigate(MTV_NAMESPACE);
        await listPage.clickCreateWithFormButton();
        await createPage.waitForPageLoad();
      });

      await providerOnlyFixtures.step('Fill form: name, project, providers', async () => {
        await createPage.fillMapName(storageMapName);
        await createPage.selectProject(MTV_NAMESPACE);
        await createPage.selectSourceProvider(testProvider.metadata.name);
        await createPage.selectTargetProvider('host');
        await createPage.waitForMappingTableReady();
      });

      await providerOnlyFixtures.step('Verify advanced options toggle is visible', async () => {
        await createPage.accessMode.verifyAdvancedOptionsToggleVisible(0);
      });

      await providerOnlyFixtures.step(
        'Expand advanced options and verify Default is selected',
        async () => {
          await createPage.accessMode.expandAdvancedOptions(0);
          const text = await createPage.accessMode.getAccessModeText(0);
          expect(text).toBe('Default');
        },
      );

      await providerOnlyFixtures.step('Select ReadWriteMany (RWX) and verify', async () => {
        await createPage.accessMode.selectAccessMode(0, 'ReadWriteMany (RWX)');
        const text = await createPage.accessMode.getAccessModeText(0);
        expect(text).toBe('ReadWriteMany (RWX)');
      });

      await providerOnlyFixtures.step('Select Default and verify it reverts', async () => {
        await createPage.accessMode.selectAccessMode(0, 'Default');
        const text = await createPage.accessMode.getAccessModeText(0);
        expect(text).toBe('Default');
      });

      await providerOnlyFixtures.step('Select source and target storage then submit', async () => {
        await createPage.selectFirstAvailableSourceAtIndex(0);
        await createPage.selectFirstAvailableTargetAtIndex(0);
        await createPage.submit();
        resourceManager.addStorageMap(storageMapName, MTV_NAMESPACE);
      });

      await providerOnlyFixtures.step(
        'Navigate to details and verify access mode is Default',
        async () => {
          await detailsPage.navigate(storageMapName);
          const modal = await detailsPage.openEditModal();
          await modal.accessMode.expandAdvancedOptions(0);
          const text = await modal.accessMode.getAccessModeText(0);
          expect(text).toBe('Default');
          await modal.cancel();
        },
      );
    },
  );
});

sharedProviderStorageMapFixtures.describe(
  'Access Mode - Edit Storage Map',
  { tag: '@downstream' },
  () => {
    requireVersion(sharedProviderStorageMapFixtures, V5_0_0);

    sharedProviderStorageMapFixtures(
      'should persist access mode through edit flow',
      async ({ page, testStorageMap, testProvider: _testProvider }) => {
        if (!testStorageMap) {
          throw new Error('testStorageMap is required');
        }

        const detailsPage = new StorageMapDetailsPage(page);
        await detailsPage.navigate(testStorageMap.name);

        await sharedProviderStorageMapFixtures.step(
          'Select source and target storage for the mapping',
          async () => {
            const modal = await detailsPage.openEditModal();
            await modal.selectFirstAvailableSourceAtIndex(0);
            await modal.selectFirstAvailableTargetAtIndex(0);
            await modal.verifySaveButtonEnabled();
            await modal.save();
          },
        );

        await sharedProviderStorageMapFixtures.step(
          'Expand advanced options and verify initial state is Default',
          async () => {
            const modal = await detailsPage.openEditModal();
            await modal.accessMode.expandAdvancedOptions(0);
            const text = await modal.accessMode.getAccessModeText(0);
            expect(text).toBe('Default');
            await modal.cancel();
          },
        );

        await sharedProviderStorageMapFixtures.step(
          'Set access mode to ReadWriteMany and save',
          async () => {
            const modal = await detailsPage.openEditModal();
            await modal.accessMode.expandAdvancedOptions(0);
            await modal.accessMode.selectAccessMode(0, 'ReadWriteMany (RWX)');
            await modal.verifySaveButtonEnabled();
            await modal.save();
          },
        );

        await sharedProviderStorageMapFixtures.step(
          'Re-open modal and verify ReadWriteMany (RWX) persisted',
          async () => {
            const modal = await detailsPage.openEditModal();
            await modal.accessMode.expandAdvancedOptions(0);
            const text = await modal.accessMode.getAccessModeText(0);
            expect(text).toBe('ReadWriteMany (RWX)');
            await modal.cancel();
          },
        );

        await sharedProviderStorageMapFixtures.step(
          'Change back to Default and verify',
          async () => {
            const modal = await detailsPage.openEditModal();
            await modal.accessMode.expandAdvancedOptions(0);
            await modal.accessMode.selectAccessMode(0, 'Default');
            await modal.verifySaveButtonEnabled();
            await modal.save();

            const verifyModal = await detailsPage.openEditModal();
            await verifyModal.accessMode.expandAdvancedOptions(0);
            const text = await verifyModal.accessMode.getAccessModeText(0);
            expect(text).toBe('Default');
            await verifyModal.cancel();
          },
        );
      },
    );
  },
);

providerOnlyFixtures.describe('Access Mode - Plan Wizard', { tag: '@downstream' }, () => {
  requireVersion(providerOnlyFixtures, V5_0_0);

  providerOnlyFixtures(
    'should configure access mode in plan wizard and display it in review',
    async ({ page, resourceManager, testProvider }) => {
      if (!testProvider) {
        throw new Error('testProvider is required');
      }

      const planName = `access-mode-plan-${crypto.randomUUID().slice(0, 8)}`;
      const testPlanData = createPlanTestData({
        planName,
        sourceProvider: testProvider.metadata.name,
        storageMap: {
          isPreexisting: false,
          name: `${planName}-storage-map`,
        },
        targetProject: { isPreexisting: true, name: 'default' },
      });

      const wizard = new CreatePlanWizardPage(page, resourceManager);

      await providerOnlyFixtures.step('Navigate to Storage Map step', async () => {
        await wizard.navigate();
        await wizard.navigateToStorageMapStep(testPlanData);
      });

      await providerOnlyFixtures.step(
        'Configure new storage map and select ReadWriteMany (RWX)',
        async () => {
          await wizard.storageMap.verifyStepVisible();
          await wizard.storageMap.waitForData();
          await wizard.storageMap.fillAndComplete(testPlanData.storageMap);

          await wizard.storageMap.accessMode.verifyAdvancedOptionsToggleVisible(0);
          await wizard.storageMap.accessMode.expandAdvancedOptions(0);
          await wizard.storageMap.accessMode.selectAccessMode(0, 'ReadWriteMany (RWX)');
          const text = await wizard.storageMap.accessMode.getAccessModeText(0);
          expect(text).toBe('ReadWriteMany (RWX)');
        },
      );

      await providerOnlyFixtures.step(
        'Verify RWO warning appears and clears on Ceph-backed target',
        async () => {
          await wizard.storageMap.accessMode.selectAccessMode(0, 'ReadWriteOnce (RWO)');
          await wizard.storageMap.accessMode.verifyRwoWarningVisible();

          await wizard.storageMap.accessMode.selectAccessMode(0, 'ReadWriteMany (RWX)');
          await wizard.storageMap.accessMode.verifyRwoWarningNotVisible();
        },
      );

      await providerOnlyFixtures.step('Proceed past Storage Map and skip to review', async () => {
        await wizard.clickNext();
        await wizard.clickSkipToReview();
      });

      await providerOnlyFixtures.step(
        'Verify access mode in review storage map table',
        async () => {
          await wizard.review.verifyStepVisible();
          await expect(wizard.review.storageMapSection).toBeVisible();
          await wizard.review.verifyStorageMapAccessMode(0, 'ReadWriteMany');
        },
      );

      await providerOnlyFixtures.step('Create plan and register for cleanup', async () => {
        await wizard.clickNext();
        await wizard.waitForPlanCreation();
        resourceManager.addPlan(planName, MTV_NAMESPACE);
      });

      await providerOnlyFixtures.step(
        'Verify access mode persists on plan details mappings tab',
        async () => {
          const planDetailsPage = new PlanDetailsPage(page);
          await planDetailsPage.mappingsTab.navigateToMappingsTab();
          await expect(planDetailsPage.mappingsTab.storageMapReviewTable).toBeVisible();
          await expect(
            planDetailsPage.mappingsTab.storageMapReviewTable.getByText('Access mode'),
          ).toBeVisible();
          await expect(
            planDetailsPage.mappingsTab.storageMapReviewTable.getByText('ReadWriteMany'),
          ).toBeVisible();
        },
      );
    },
  );
});

sharedProviderFixtures.describe(
  'Access Mode - Plan Details Mappings Display',
  { tag: '@downstream' },
  () => {
    requireVersion(sharedProviderFixtures, V5_0_0);

    sharedProviderFixtures(
      'should display access mode column on plan details mappings tab',
      async ({ page, testPlan, testProvider: _testProvider }) => {
        if (!testPlan) {
          throw new Error('testPlan is required');
        }

        const planDetailsPage = new PlanDetailsPage(page);

        await sharedProviderFixtures.step(
          'Navigate to plan details mappings tab and verify access mode column',
          async () => {
            await planDetailsPage.navigate(testPlan.metadata.name, testPlan.metadata.namespace);
            await planDetailsPage.mappingsTab.navigateToMappingsTab();
            const reviewTable = planDetailsPage.mappingsTab.storageMapReviewTable;
            await expect(reviewTable).toBeVisible();
            await expect(reviewTable.getByText('Access mode')).toBeVisible();
          },
        );
      },
    );
  },
);

sharedProviderFixtures.describe('Access Mode - Plan Details Edit', { tag: '@downstream' }, () => {
  requireVersion(sharedProviderFixtures, V5_0_0);

  sharedProviderFixtures(
    'should persist access mode through plan details storage map edit',
    async ({ page, testPlan, testProvider: _testProvider }) => {
      if (!testPlan) {
        throw new Error('testPlan is required');
      }

      const planDetailsPage = new PlanDetailsPage(page);
      await planDetailsPage.mappingsTab.navigateToMappingsTab();

      await sharedProviderFixtures.step(
        'Open storage map edit modal and set ReadWriteMany (RWX)',
        async () => {
          const modal = await planDetailsPage.mappingsTab.openStorageMapEditModal();
          await modal.accessMode.expandAdvancedOptions(0);
          await modal.accessMode.selectAccessMode(0, 'ReadWriteMany (RWX)');
          await modal.verifySaveButtonEnabled();
          await modal.save();
        },
      );

      await sharedProviderFixtures.step(
        'Re-open modal and verify ReadWriteMany (RWX) persisted',
        async () => {
          const modal = await planDetailsPage.mappingsTab.openStorageMapEditModal();
          await modal.accessMode.expandAdvancedOptions(0);
          const text = await modal.accessMode.getAccessModeText(0);
          expect(text).toBe('ReadWriteMany (RWX)');
          await modal.cancel();
        },
      );
    },
  );
});

sharedProviderStorageMapFixtures.describe(
  'Access Mode - RWO Warning',
  { tag: '@downstream' },
  () => {
    requireVersion(sharedProviderStorageMapFixtures, V5_0_0);

    sharedProviderStorageMapFixtures(
      'should show RWO warning for Ceph-backed storage classes',
      async ({ page, testStorageMap, testProvider: _testProvider }) => {
        if (!testStorageMap) {
          throw new Error('testStorageMap is required');
        }

        const detailsPage = new StorageMapDetailsPage(page);
        await detailsPage.navigate(testStorageMap.name);

        await sharedProviderStorageMapFixtures.step(
          'Select source and Ceph-backed target storage',
          async () => {
            const modal = await detailsPage.openEditModal();
            await modal.selectFirstAvailableSourceAtIndex(0);
            await modal.selectFirstAvailableTargetAtIndex(0);
            await modal.verifySaveButtonEnabled();
            await modal.save();
          },
        );

        const modal = await detailsPage.openEditModal();
        await modal.accessMode.expandAdvancedOptions(0);

        await sharedProviderStorageMapFixtures.step(
          'Select ReadWriteOnce (RWO) and verify RWO warning appears',
          async () => {
            await modal.accessMode.selectAccessMode(0, 'ReadWriteOnce (RWO)');
            await modal.accessMode.verifyRwoWarningVisible();
          },
        );

        await sharedProviderStorageMapFixtures.step(
          'Switch to ReadWriteMany (RWX) and verify warning disappears',
          async () => {
            await modal.accessMode.selectAccessMode(0, 'ReadWriteMany (RWX)');
            await modal.accessMode.verifyRwoWarningNotVisible();
          },
        );

        await sharedProviderStorageMapFixtures.step(
          'Switch to Default and verify no warning',
          async () => {
            await modal.accessMode.selectAccessMode(0, 'Default');
            await modal.accessMode.verifyRwoWarningNotVisible();
          },
        );

        await modal.cancel();
      },
    );
  },
);
