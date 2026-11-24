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
        mappings: [
          { sourceNetwork: SourceNetworks.VM_NETWORK, targetNetwork: NetworkTargets.DEFAULT },
        ],
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
        mappings: [
          { sourceNetwork: SourceNetworks.VM_NETWORK, targetNetwork: NetworkTargets.IGNORE },
        ],
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

  /**
   * Isolates NAD mapping creation so each test can use a distinct NAD target
   * without duplicating the source/target selection plumbing.
   */
  const addNadMapping = async (
    modal: Awaited<ReturnType<NetworkMapDetailsPage['openEditModal']>>,
    sourceNetwork: string,
    targetNadLabel: string,
  ): Promise<number> => {
    const rowIndex = await modal.addMapping();
    await modal.selectSourceNetworkAtIndex(rowIndex, sourceNetwork);
    await modal.selectTargetNetworkAtIndex(rowIndex, targetNadLabel);
    return rowIndex;
  };

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

      await test.step('Pod target hides IP mode', async () => {
        const podModal = await networkMapDetailsPage.openEditModal();
        const podRowIndex = await addNadMapping(
          podModal,
          SourceNetworks.VM_NETWORK,
          NetworkTargets.DEFAULT,
        );
        await podModal.verifyNetworkIPModeNotVisibleAtIndex(podRowIndex);
        await podModal.save();
      });

      await test.step('NAD target shows expandable IP mode and persists', async () => {
        const nadModal = await networkMapDetailsPage.openEditModal();
        const nadRowIndex = await addNadMapping(
          nadModal,
          SourceNetworks.MGMT_NETWORK,
          targetNadLabel,
        );
        await nadModal.expandNetworkIPModeAtIndex(nadRowIndex);
        await nadModal.selectNetworkIPModeAtIndex(nadRowIndex, 'Preserve static IPs');
        await nadModal.verifySaveButtonEnabled();
        await nadModal.save();

        const verifyModal = await networkMapDetailsPage.openEditModal();
        await verifyModal.expandNetworkIPModeAtIndex(nadRowIndex);
        await verifyModal.verifyNetworkIPModeAtIndex(nadRowIndex, 'Preserve static IPs');
        await verifyModal.cancel();
      });
    },
  );

  sharedProviderTest(
    'should review IP mode in details table and clear to Inherit',
    async ({ page, resourceManager, testNetworkMap }) => {
      if (!testNetworkMap) {
        throw new Error('testNetworkMap is required');
      }

      const networkMapDetailsPage = new NetworkMapDetailsPage(page);
      const reviewTable = page.getByTestId('network-map-review-table');
      const targetNad = await createTestNad(resourceManager, { namespace: MTV_NAMESPACE });
      const targetNadLabel = `${MTV_NAMESPACE}/${targetNad.metadata.name}`;

      await test.step('Create NAD mapping with DHCP and verify review table', async () => {
        await networkMapDetailsPage.navigate(testNetworkMap.name);
        const modal = await networkMapDetailsPage.openEditModal();
        const rowIndex = await addNadMapping(modal, SourceNetworks.MGMT_NETWORK, targetNadLabel);
        await modal.expandNetworkIPModeAtIndex(rowIndex);
        await modal.selectNetworkIPModeAtIndex(rowIndex, 'DHCP');
        await modal.save();

        await expect(
          reviewTable.getByRole('columnheader', { name: 'Network IP mode' }),
        ).toBeVisible();
        await expect(reviewTable.getByRole('cell', { name: 'DHCP' })).toBeVisible();
        await expect(reviewTable).toContainText('DHCP');
      });

      await test.step('Clear IP mode and verify Inherit in review table', async () => {
        const clearModal = await networkMapDetailsPage.openEditModal();
        const lastRow = (await clearModal.getMappingCount()) - 1;
        await clearModal.expandNetworkIPModeAtIndex(lastRow);
        await clearModal.clearNetworkIPModeAtIndex(lastRow);
        await clearModal.save();
        await expect(reviewTable.getByRole('cell', { name: 'Inherit Plan setting' })).toBeVisible();
      });
    },
  );
});
