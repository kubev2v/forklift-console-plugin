import { expect } from '@playwright/test';

import { createTestNad } from '../../../fixtures/helpers/resourceCreationHelpers';
import {
  isolatedNetworkMapFixtures as test,
  sharedProviderNetworkMapFixtures as sharedProviderTest,
} from '../../../fixtures/resourceFixtures';
import { NetworkMapDetailsPage } from '../../../page-objects/NetworkMapDetailsPage';
import { NetworkTargets, SourceNetworks } from '../../../types/test-data';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V2_12_0, V5_1_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Network Map Details - Editing', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should test network map editing interactions', async ({
    page,
    testNetworkMap,
    testProvider: _testProvider,
  }) => {
    if (!testNetworkMap) {
      throw new Error('testNetworkMap is required');
    }

    const networkMapDetailsPage = new NetworkMapDetailsPage(page);
    await networkMapDetailsPage.navigate(testNetworkMap.name);

    await test.step('Add initial mapping', async () => {
      const modal = await networkMapDetailsPage.openEditModal();
      await modal.verifyModalStructure();

      const newRowIndex = await modal.addMapping();
      expect(newRowIndex).toBe(0);

      await modal.selectSourceNetworkAtIndex(newRowIndex, SourceNetworks.VM_NETWORK);
      await modal.selectTargetNetworkAtIndex(newRowIndex, NetworkTargets.DEFAULT);
      await modal.verifySaveButtonEnabled();
      await modal.save();

      await expect
        .poll(
          async () => {
            const modalAfterSave = await networkMapDetailsPage.openEditModal();
            const mappingCount = await modalAfterSave.getMappingCount();
            await modalAfterSave.cancel();
            return mappingCount;
          },
          { timeout: 30_000 },
        )
        .toBe(1);
    });

    await test.step('Edit network mapping and verify save', async () => {
      const modal = await networkMapDetailsPage.openEditModal();

      // Change target from 'Default network' (set in previous step) to 'Ignore network'
      await modal.selectTargetNetworkAtIndex(0, NetworkTargets.IGNORE);
      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterSave = await networkMapDetailsPage.openEditModal();
      const currentTarget = await modalAfterSave.getTargetNetworkAtIndex(0);
      expect(currentTarget.toLowerCase()).toContain('ignore');
      await modalAfterSave.cancel();
    });

    await test.step('Add and remove additional mapping', async () => {
      const modal = await networkMapDetailsPage.openEditModal();
      const initialCount = await modal.getMappingCount();

      const newRowIndex = await modal.addMapping();
      expect(newRowIndex).toBe(initialCount);
      await modal.selectSourceNetworkAtIndex(newRowIndex, SourceNetworks.MGMT_NETWORK);
      await modal.selectTargetNetworkAtIndex(newRowIndex, NetworkTargets.IGNORE);
      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterAdd = await networkMapDetailsPage.openEditModal();
      const countAfterAdd = await modalAfterAdd.getMappingCount();
      expect(countAfterAdd).toBe(initialCount + 1);

      await modalAfterAdd.removeMapping(countAfterAdd - 1);
      expect(await modalAfterAdd.getMappingCount()).toBe(initialCount);
      await modalAfterAdd.save();
    });
  });
});

sharedProviderTest.describe('Network Map Network IP mode - Editing', { tag: '@downstream' }, () => {
  requireVersion(sharedProviderTest, V5_1_0);

  sharedProviderTest(
    'should edit IP mode and disable it for the default network',
    async ({ page, resourceManager, testNetworkMap }) => {
      if (!testNetworkMap) {
        throw new Error('testNetworkMap is required');
      }

      const networkMapDetailsPage = new NetworkMapDetailsPage(page);
      await networkMapDetailsPage.navigate(testNetworkMap.name);

      const targetNad = await createTestNad(resourceManager, { namespace: MTV_NAMESPACE });
      const targetNadLabel = `${MTV_NAMESPACE}/${targetNad.metadata.name}`;

      const mappingModal = await networkMapDetailsPage.openEditModal();
      const newRowIndex = await mappingModal.addMapping();
      await mappingModal.selectSourceNetworkAtIndex(newRowIndex, SourceNetworks.VM_NETWORK);
      await mappingModal.selectTargetNetworkAtIndex(newRowIndex, NetworkTargets.DEFAULT);
      await mappingModal.save();

      const secondMappingModal = await networkMapDetailsPage.openEditModal();
      const secondRowIndex = await secondMappingModal.addMapping();
      await secondMappingModal.selectSourceNetworkAtIndex(
        secondRowIndex,
        SourceNetworks.MGMT_NETWORK,
      );
      await secondMappingModal.selectTargetNetworkAtIndex(secondRowIndex, targetNadLabel);
      await secondMappingModal.save();

      const modeModal = await networkMapDetailsPage.openNetworkIPModeModal();
      await modeModal.verifyModalStructure();
      await modeModal.verifyModeSelectorDisabled(NetworkTargets.DEFAULT);
      await modeModal.selectMode(targetNadLabel, 'Preserve static IPs');
      await modeModal.verifySaveButtonEnabled();
      await modeModal.save();

      const savedModeModal = await networkMapDetailsPage.openNetworkIPModeModal();
      await savedModeModal.verifyMode(targetNadLabel, 'Preserve static IPs');
      await savedModeModal.cancel();
    },
  );
});
