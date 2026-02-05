import { expect } from '@playwright/test';

import { sharedProviderNetworkMapFixtures as test } from '../../../fixtures/resourceFixtures';
import { NetworkMapDetailsPage } from '../../../page-objects/NetworkMapDetailsPage';

test.describe('Network Map Details - Editing', { tag: '@downstream' }, () => {
  test('should test network map editing interactions', async ({
    page,
    testNetworkMap,
    testProvider: _testProvider,
  }) => {
    if (!testNetworkMap) throw new Error('testNetworkMap is required');

    const networkMapDetailsPage = new NetworkMapDetailsPage(page);
    await networkMapDetailsPage.navigate(testNetworkMap.metadata.name);

    await test.step('Verify network map details page loads correctly', async () => {
      await networkMapDetailsPage.verifyNetworkMapDetailsPage({
        networkMapName: testNetworkMap.metadata.name,
        sourceProvider: testNetworkMap.testData.sourceProvider,
        targetProvider: testNetworkMap.testData.targetProvider,
      });
    });

    await test.step('Verify edit modal structure', async () => {
      const modal = await networkMapDetailsPage.openEditModal();
      await modal.verifyModalStructure();
      const mappingCount = await modal.getMappingCount();
      expect(mappingCount).toBeGreaterThan(0);
      await modal.verifySaveButtonDisabled();
      await modal.cancel();
    });

    await test.step('Edit network mapping and verify save', async () => {
      const modal = await networkMapDetailsPage.openEditModal();
      const originalTarget = await modal.getTargetNetworkAtIndex(0);
      const newTarget = originalTarget.includes('Ignore') ? 'Default network' : 'Ignore network';

      await modal.selectTargetNetworkAtIndex(0, newTarget);
      await modal.verifySaveButtonEnabled();
      await modal.save();

      // Verify change was saved
      const modalAfterSave = await networkMapDetailsPage.openEditModal();
      const currentTarget = await modalAfterSave.getTargetNetworkAtIndex(0);
      expect(currentTarget).toContain(newTarget.split(' ')[0]);
      await modalAfterSave.cancel();
    });

    await test.step('Add and remove network mapping', async () => {
      const modal = await networkMapDetailsPage.openEditModal();
      const initialCount = await modal.getMappingCount();

      // Add new mapping
      const newRowIndex = await modal.addMapping();
      expect(newRowIndex).toBe(initialCount);
      await modal.selectSourceNetworkAtIndex(newRowIndex, 'VM Network');
      await modal.selectTargetNetworkAtIndex(newRowIndex, 'Ignore network');
      await modal.verifySaveButtonEnabled();
      await modal.save();

      // Verify mapping was added and remove it
      const modalAfterAdd = await networkMapDetailsPage.openEditModal();
      const countAfterAdd = await modalAfterAdd.getMappingCount();
      expect(countAfterAdd).toBe(initialCount + 1);

      await modalAfterAdd.removeMapping(countAfterAdd - 1);
      expect(await modalAfterAdd.getMappingCount()).toBe(initialCount);
      await modalAfterAdd.save();
    });
  });
});
