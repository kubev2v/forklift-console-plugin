import { expect, type Page } from '@playwright/test';

import { sharedProviderCustomPlanFixtures as test } from '../../../fixtures/resourceFixtures';
import { InspectVirtualMachinesModal } from '../../../page-objects/InspectVirtualMachinesModal';
import { ProviderDetailsPage } from '../../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

type TestProvider = { metadata: { name: string; namespace: string } };

const setupProviderDetailsPage = async (
  page: Page,
  testProvider: TestProvider | undefined,
): Promise<ProviderDetailsPage> => {
  if (!testProvider) throw new Error('testProvider is required');
  const providerDetailsPage = new ProviderDetailsPage(page);
  await providerDetailsPage.navigate(testProvider.metadata.name, testProvider.metadata.namespace);
  await providerDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
  return providerDetailsPage;
};

test.describe('Provider Deep Inspection', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should show Inspect VMs button for vSphere providers', async ({ page, testProvider }) => {
    const providerDetailsPage = await setupProviderDetailsPage(page, testProvider);

    await test.step('verify Inspect VMs button is visible', async () => {
      const isVisible = await providerDetailsPage.isInspectVmsButtonVisible();
      expect(isVisible).toBe(true);
    });
  });

  test('should open inspect modal from VMs tab button', async ({ page, testProvider }) => {
    const providerDetailsPage = await setupProviderDetailsPage(page, testProvider);
    const inspectModal = new InspectVirtualMachinesModal(page);

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

  test('should select VMs and submit inspection', async ({ page, testProvider }) => {
    const providerDetailsPage = await setupProviderDetailsPage(page, testProvider);
    const inspectModal = new InspectVirtualMachinesModal(page);

    await test.step('open inspect modal', async () => {
      await providerDetailsPage.clickInspectVmsButton();
      await inspectModal.waitForModalOpen();
      await inspectModal.waitForVmTableLoaded();
    });

    await test.step('select a VM from inventory', async () => {
      await inspectModal.selectFirstEligibleVm();
    });

    await test.step('submit inspection', async () => {
      const buttonText = await inspectModal.getConfirmButtonText();
      expect(buttonText).toContain('Inspect');
      await inspectModal.clickInspect();
    });
  });

  test('should show inspection status column in VMs tree table', async ({ page, testProvider }) => {
    await setupProviderDetailsPage(page, testProvider);

    await test.step('verify Inspection status column header is visible', async () => {
      const columnHeader = page.locator('th', { hasText: 'Inspection status' });
      await expect(columnHeader).toBeVisible();
    });
  });

  test('should show inspection section in expanded VM row', async ({ page, testProvider }) => {
    const providerDetailsPage = await setupProviderDetailsPage(page, testProvider);

    await test.step('expand first folder and expand a VM row', async () => {
      await providerDetailsPage.virtualMachinesTab.expandFirstFolder();
      await providerDetailsPage.virtualMachinesTab.expandFirstVMRow();
    });

    await test.step('verify Inspections section is visible', async () => {
      const inspectionsSection = page.getByTestId('inspections-section');
      await expect(inspectionsSection).toBeVisible({ timeout: 15_000 });
    });
  });
});
