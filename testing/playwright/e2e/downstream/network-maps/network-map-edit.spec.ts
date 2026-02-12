import { expect } from '@playwright/test';

import { sharedProviderNetworkMapFixtures as test } from '../../../fixtures/resourceFixtures';
import { NetworkMapDetailsPage } from '../../../page-objects/NetworkMapDetailsPage';
import { NetworkTargets, SourceNetworks } from '../../../types/test-data';
import { requireVersion, V2_11_0 } from '../../../utils/version';

test.describe('Network Map Details - Editing', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);

  test('should test network map editing interactions', async ({
    page,
    testNetworkMap,
    testProvider: _testProvider,
  }) => {
    if (!testNetworkMap) throw new Error('testNetworkMap is required');

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

      const modalAfterSave = await networkMapDetailsPage.openEditModal();
      const mappingCount = await modalAfterSave.getMappingCount();
      expect(mappingCount).toBe(1);
      await modalAfterSave.cancel();
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
