import { expect } from '@playwright/test';

import {
  providerOnlyFixtures,
  sharedProviderFixtures,
  sharedProviderStorageMapFixtures,
} from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { StorageMapCreatePage } from '../../../page-objects/StorageMapCreatePage';
import { StorageMapDetailsPage } from '../../../page-objects/StorageMapDetailsPage';
import { StorageMapsListPage } from '../../../page-objects/StorageMapsListPage';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V5_0_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

providerOnlyFixtures.describe('Access Mode - Create Storage Map', { tag: '@downstream' }, () => {
  requireVersion(providerOnlyFixtures, V5_0_0);

  providerOnlyFixtures(
    'should create storage map with access mode selection',
    async ({ page, resourceManager, testProvider }) => {
      if (!testProvider) throw new Error('testProvider is required');

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

      await providerOnlyFixtures.step('Select ReadWriteMany and verify', async () => {
        await createPage.accessMode.selectAccessMode(0, 'ReadWriteMany');
        const text = await createPage.accessMode.getAccessModeText(0);
        expect(text).toBe('ReadWriteMany');
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
        if (!testStorageMap) throw new Error('testStorageMap is required');

        const detailsPage = new StorageMapDetailsPage(page);
        await detailsPage.navigate(testStorageMap.name);

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
            await modal.accessMode.selectAccessMode(0, 'ReadWriteMany');
            await modal.verifySaveButtonEnabled();
            await modal.save();
          },
        );

        await sharedProviderStorageMapFixtures.step(
          'Re-open modal and verify ReadWriteMany persisted',
          async () => {
            const modal = await detailsPage.openEditModal();
            await modal.accessMode.expandAdvancedOptions(0);
            const text = await modal.accessMode.getAccessModeText(0);
            expect(text).toBe('ReadWriteMany');
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

sharedProviderFixtures.describe('Access Mode - Plan Wizard Review', { tag: '@downstream' }, () => {
  requireVersion(sharedProviderFixtures, V5_0_0);

  sharedProviderFixtures(
    'should display access mode in plan wizard review step',
    async ({ page, testPlan, testProvider: _testProvider }) => {
      if (!testPlan) throw new Error('testPlan is required');

      const planDetailsPage = new PlanDetailsPage(page);

      await sharedProviderFixtures.step(
        'Navigate to plan details mappings tab and verify access mode column',
        async () => {
          await planDetailsPage.mappingsTab.navigateToMappingsTab();
          const reviewTable = page.getByTestId('storage-map-review-table');
          await expect(reviewTable).toBeVisible();
          await expect(reviewTable.getByText('Access mode')).toBeVisible();
        },
      );
    },
  );
});

sharedProviderFixtures.describe('Access Mode - Plan Details Edit', { tag: '@downstream' }, () => {
  requireVersion(sharedProviderFixtures, V5_0_0);

  sharedProviderFixtures(
    'should persist access mode through plan details storage map edit',
    async ({ page, testPlan, testProvider: _testProvider }) => {
      if (!testPlan) throw new Error('testPlan is required');

      const planDetailsPage = new PlanDetailsPage(page);
      await planDetailsPage.mappingsTab.navigateToMappingsTab();

      await sharedProviderFixtures.step(
        'Open storage map edit modal and set ReadWriteMany',
        async () => {
          const modal = await planDetailsPage.mappingsTab.openStorageMapEditModal();
          await modal.accessMode.expandAdvancedOptions(0);
          await modal.accessMode.selectAccessMode(0, 'ReadWriteMany');
          await modal.verifySaveButtonEnabled();
          await modal.save();
        },
      );

      await sharedProviderFixtures.step(
        'Re-open modal and verify ReadWriteMany persisted',
        async () => {
          const modal = await planDetailsPage.mappingsTab.openStorageMapEditModal();
          await modal.accessMode.expandAdvancedOptions(0);
          const text = await modal.accessMode.getAccessModeText(0);
          expect(text).toBe('ReadWriteMany');
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
        if (!testStorageMap) throw new Error('testStorageMap is required');

        const detailsPage = new StorageMapDetailsPage(page);
        await detailsPage.navigate(testStorageMap.name);

        const modal = await detailsPage.openEditModal();
        await modal.accessMode.expandAdvancedOptions(0);

        await sharedProviderStorageMapFixtures.step(
          'Select ReadWriteOnce and check for RWO warning',
          async () => {
            await modal.accessMode.selectAccessMode(0, 'ReadWriteOnce');
          },
        );

        await sharedProviderStorageMapFixtures.step(
          'Switch to ReadWriteMany and verify warning disappears',
          async () => {
            await modal.accessMode.selectAccessMode(0, 'ReadWriteMany');
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
