import { expect } from '@playwright/test';

import { customProviderOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V5_0_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const OVIRT_PROVIDER_KEY = process.env.OVIRT_PROVIDER ?? 'ovirt-4.4.9';

test.describe('Plan Creation Wizard - Selected VMs toggle', { tag: '@downstream' }, () => {
  requireVersion(test, V5_0_0);

  test('should filter the VM table to selected guests on a non-vSphere provider', async ({
    page,
    createCustomProvider,
    resourceManager,
  }) => {
    test.setTimeout(300_000);

    const provider = await test.step('Create oVirt source provider', async () => {
      return createCustomProvider({
        namePrefix: 'ovirt-selected-toggle',
        providerKey: OVIRT_PROVIDER_KEY,
      });
    });

    const createWizard = new CreatePlanWizardPage(page, resourceManager);
    const planName = `selected-toggle-${crypto.randomUUID().slice(0, 8)}`;

    await test.step('Open create plan wizard and fill general information', async () => {
      await createWizard.navigate();
      await createWizard.waitForWizardLoad();
      await createWizard.generalInformation.fillPlanName(planName);
      await createWizard.generalInformation.selectProject(MTV_NAMESPACE, 'plan-project-select');
      await createWizard.generalInformation.selectSourceProvider(provider.metadata.name);
      await createWizard.generalInformation.selectTargetProvider('host');
      await createWizard.generalInformation.waitForTargetProviderNamespaces();
      await createWizard.generalInformation.selectTargetProject({
        isPreexisting: true,
        name: 'default',
      });
      await createWizard.clickNext();
    });

    let selectedVmName = '';
    let allRowCount = 0;

    await test.step('Verify Selected toggle is disabled before any selection', async () => {
      await createWizard.virtualMachines.verifyStepVisible();
      await createWizard.virtualMachines.verifyTableLoaded();
      await createWizard.virtualMachines.verifySelectionToggleVisible();
      await createWizard.virtualMachines.verifySelectedToggleDisabled();

      allRowCount = await createWizard.virtualMachines.getVisibleVmRowCount();
      expect(allRowCount).toBeGreaterThan(1);
    });

    await test.step('Select one VM and enable Selected filter', async () => {
      selectedVmName = await createWizard.virtualMachines.selectVirtualMachineAtIndex(0);
      expect(selectedVmName).toBeTruthy();

      await createWizard.virtualMachines.verifySelectedToggleEnabled();
      await createWizard.virtualMachines.clickShowSelectedVms();

      await expect.poll(async () => createWizard.virtualMachines.getVisibleVmRowCount()).toBe(1);
      await createWizard.virtualMachines.verifyRowIsVisible({ Name: selectedVmName });
    });

    await test.step('Switch back to All and restore the full VM list', async () => {
      await createWizard.virtualMachines.clickShowAllVms();

      await expect
        .poll(async () => createWizard.virtualMachines.getVisibleVmRowCount())
        .toBe(allRowCount);
    });
  });
});
