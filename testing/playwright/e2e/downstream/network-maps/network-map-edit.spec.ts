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

      await networkMapDetailsPage.verifyNetworkMapDetailsPage({
        mappings: [{ sourceNetwork: SourceNetworks.VM_NETWORK, targetNetwork: NetworkTargets.DEFAULT }],
        networkMapName: testNetworkMap.name,
        sourceProvider: testNetworkMap.sourceProvider,
        targetProvider: testNetworkMap.targetProvider,
      });
    });

    await test.step('Edit network mapping and verify save', async () => {
      const modal = await networkMapDetailsPage.openEditModal();
      await modal.verifyModalStructure();

      const editedRowIndex = 0;
      await modal.selectTargetNetworkAtIndex(editedRowIndex, NetworkTargets.IGNORE);
      await modal.verifySaveButtonEnabled();
      await modal.save();

      await networkMapDetailsPage.verifyNetworkMapDetailsPage({
        mappings: [{ sourceNetwork: SourceNetworks.VM_NETWORK, targetNetwork: NetworkTargets.IGNORE }],
        networkMapName: testNetworkMap.name,
        sourceProvider: testNetworkMap.sourceProvider,
        targetProvider: testNetworkMap.targetProvider,
      });
    });

    await test.step('Add and remove additional mapping', async () => {
      const modal = await networkMapDetailsPage.openEditModal();
      const newRowIndex = await modal.addMapping();
      await modal.selectSourceNetworkAtIndex(newRowIndex, SourceNetworks.MGMT_NETWORK);
      await modal.selectTargetNetworkAtIndex(newRowIndex, NetworkTargets.DEFAULT);
      await modal.save();

      const secondModal = await networkMapDetailsPage.openEditModal();
      await secondModal.removeMapping(newRowIndex);
      await secondModal.verifySaveButtonEnabled();
      await secondModal.save();
    });
  });
});

sharedProviderTest.describe('Network Map Network IP mode - Editing', { tag: '@downstream' }, () => {
  requireVersion(sharedProviderTest, V5_1_0);

  sharedProviderTest(
    'should edit IP mode inline and hide it for default/ignored targets',
    async ({ page, resourceManager, testNetworkMap }) => {
      if (!testNetworkMap) {
        throw new Error('testNetworkMap is required');
      }

      const networkMapDetailsPage = new NetworkMapDetailsPage(page);
      await networkMapDetailsPage.navigate(testNetworkMap.name);

      const targetNad = await createTestNad(resourceManager, { namespace: MTV_NAMESPACE });
      const targetNadLabel = `${MTV_NAMESPACE}/${targetNad.metadata.name}`;

      // Pod target: IP mode hidden (per mapping, part of map section table)
      const podModal = await networkMapDetailsPage.openEditModal();
      const podRowIndex = await podModal.addMapping();
      await podModal.selectSourceNetworkAtIndex(podRowIndex, SourceNetworks.VM_NETWORK);
      await podModal.selectTargetNetworkAtIndex(podRowIndex, NetworkTargets.DEFAULT);
      await podModal.verifyNetworkIPModeNotVisibleAtIndex(podRowIndex);
      await podModal.save();

      // NAD target: IP mode editable inline (expandable)
      const nadModal = await networkMapDetailsPage.openEditModal();
      const nadRowIndex = await nadModal.addMapping();
      await nadModal.selectSourceNetworkAtIndex(nadRowIndex, SourceNetworks.MGMT_NETWORK);
      await nadModal.selectTargetNetworkAtIndex(nadRowIndex, targetNadLabel);
      await nadModal.expandNetworkIPModeAtIndex(nadRowIndex);
      await nadModal.selectNetworkIPModeAtIndex(nadRowIndex, 'Preserve static IPs');
      await nadModal.verifySaveButtonEnabled();
      await nadModal.save();

      // Persisted across edit open — expand to reveal stored value
      const verifyModal = await networkMapDetailsPage.openEditModal();
      await verifyModal.expandNetworkIPModeAtIndex(nadRowIndex);
      await expect(verifyModal.getNetworkIPModeAtIndex(nadRowIndex)).resolves.toContain('Preserve static IPs');
      await verifyModal.cancel();
    },
  );

  sharedProviderTest(
    'should review IP mode in details table (30/30/30) and clear to Inherit',
    async ({ page, resourceManager, testNetworkMap }) => {
      if (!testNetworkMap) {
        throw new Error('testNetworkMap is required');
      }

      const networkMapDetailsPage = new NetworkMapDetailsPage(page);
      await networkMapDetailsPage.navigate(testNetworkMap.name);

      const targetNad = await createTestNad(resourceManager, { namespace: MTV_NAMESPACE });
      const targetNadLabel = `${MTV_NAMESPACE}/${targetNad.metadata.name}`;

      const modal = await networkMapDetailsPage.openEditModal();
      const rowIndex = await modal.addMapping();
      await modal.selectSourceNetworkAtIndex(rowIndex, SourceNetworks.MGMT_NETWORK);
      await modal.selectTargetNetworkAtIndex(rowIndex, targetNadLabel);
      await modal.expandNetworkIPModeAtIndex(rowIndex);
      await modal.selectNetworkIPModeAtIndex(rowIndex, 'DHCP');
      await modal.save();

      // Details read-only table shows 30/30/30 with resolved value
      await expect(page.getByRole('columnheader', { name: 'Network IP mode' })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'DHCP' })).toBeVisible();
      await expect(page.locator('[data-testid="network-map-review-table"]')).toContainText('DHCP');

      // Clear returns to Inherit (absent key)
      const clearModal = await networkMapDetailsPage.openEditModal();
      await clearModal.expandNetworkIPModeAtIndex(rowIndex);
      await clearModal.clearNetworkIPModeAtIndex(rowIndex);
      await expect(clearModal.getNetworkIPModeAtIndex(rowIndex)).resolves.toContain('Inherit');
      await clearModal.save();
      await expect(page.getByRole('cell', { name: 'Inherit Plan setting' })).toBeVisible();
    },
  );
});
