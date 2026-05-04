import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { InspectVirtualMachinesModal } from '../../../page-objects/InspectVirtualMachinesModal';
import { ProviderDetailsPage } from '../../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Provider Deep Inspection', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should show Inspect VMs button for vSphere providers', async ({ page, testProvider }) => {
    if (!testProvider) throw new Error('testProvider is required');
    const providerDetailsPage = new ProviderDetailsPage(page);
    const { name, namespace } = testProvider.metadata;

    await test.step('navigate to provider details', async () => {
      await providerDetailsPage.navigate(name, namespace);
    });

    await test.step('verify Inspect VMs button is visible', async () => {
      const isVisible = await providerDetailsPage.isInspectVmsButtonVisible();
      expect(isVisible).toBe(true);
    });
  });

  test('should open inspect modal from header button', async ({ page, testProvider }) => {
    if (!testProvider) throw new Error('testProvider is required');
    const providerDetailsPage = new ProviderDetailsPage(page);
    const inspectModal = new InspectVirtualMachinesModal(page);
    const { name, namespace } = testProvider.metadata;

    await test.step('navigate to provider details', async () => {
      await providerDetailsPage.navigate(name, namespace);
    });

    await test.step('click Inspect VMs button', async () => {
      await providerDetailsPage.clickInspectVmsButton();
    });

    await test.step('verify modal opens with Tech Preview label', async () => {
      await inspectModal.waitForModalOpen();
      await expect(inspectModal.techPreviewLabel).toBeVisible();
    });

    await test.step('verify VM table loads inventory VMs', async () => {
      await inspectModal.waitForVmTableLoaded();
    });

    await test.step('close modal', async () => {
      await inspectModal.close();
    });
  });

  test('should open inspect modal from actions dropdown', async ({ page, testProvider }) => {
    if (!testProvider) throw new Error('testProvider is required');
    const providerDetailsPage = new ProviderDetailsPage(page);
    const inspectModal = new InspectVirtualMachinesModal(page);
    const { name, namespace } = testProvider.metadata;

    await test.step('navigate to provider details', async () => {
      await providerDetailsPage.navigate(name, namespace);
    });

    await test.step('open actions dropdown and click Inspect VMs', async () => {
      await providerDetailsPage.clickInspectVmsFromActions();
    });

    await test.step('verify modal opens', async () => {
      await inspectModal.waitForModalOpen();
    });

    await test.step('close modal', async () => {
      await inspectModal.close();
    });
  });

  test('should select VMs and submit inspection', async ({ page, testProvider }) => {
    if (!testProvider) throw new Error('testProvider is required');
    const providerDetailsPage = new ProviderDetailsPage(page);
    const inspectModal = new InspectVirtualMachinesModal(page);
    const { name, namespace } = testProvider.metadata;

    await test.step('navigate to provider details', async () => {
      await providerDetailsPage.navigate(name, namespace);
    });

    await test.step('open inspect modal', async () => {
      await providerDetailsPage.clickInspectVmsButton();
      await inspectModal.waitForModalOpen();
      await inspectModal.waitForVmTableLoaded();
    });

    await test.step('select a VM from inventory', async () => {
      const firstVmRow = inspectModal.vmTable.locator('tbody tr').first();
      await firstVmRow.locator('input[type="checkbox"]').check();
    });

    await test.step('submit inspection', async () => {
      const buttonText = await inspectModal.getConfirmButtonText();
      expect(buttonText).toContain('Inspect');
      await inspectModal.clickInspect();
    });
  });

  test('should show inspection status column in VMs tree table', async ({ page, testProvider }) => {
    if (!testProvider) throw new Error('testProvider is required');
    const providerDetailsPage = new ProviderDetailsPage(page);
    const { name, namespace } = testProvider.metadata;

    await test.step('navigate to provider details VMs tab', async () => {
      await providerDetailsPage.navigate(name, namespace);
      await providerDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    });

    await test.step('verify Inspection status column header is visible', async () => {
      const columnHeader = page.locator('th', { hasText: 'Inspection status' });
      await expect(columnHeader).toBeVisible();
    });
  });

  test('should show inspection section in expanded VM row', async ({ page, testProvider }) => {
    if (!testProvider) throw new Error('testProvider is required');
    const providerDetailsPage = new ProviderDetailsPage(page);
    const { name, namespace } = testProvider.metadata;

    await test.step('navigate to provider details VMs tab', async () => {
      await providerDetailsPage.navigate(name, namespace);
      await providerDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    });

    await test.step('expand a VM in the tree table', async () => {
      const treeTable = page.getByTestId('vsphere-tree-table');
      await expect(treeTable).toBeVisible();
      const vmRow = treeTable.locator('tr[data-testid*="-vm-"]').first();
      await vmRow.click();
    });

    await test.step('verify Inspections section is visible', async () => {
      const inspectionsSection = page.getByTestId('inspections-section');
      await expect(inspectionsSection).toBeVisible({ timeout: 10_000 });
    });
  });
});
