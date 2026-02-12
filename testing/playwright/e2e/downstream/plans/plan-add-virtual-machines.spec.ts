import { expect } from '@playwright/test';

import { sharedProviderCustomPlanFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';

test.describe('Plan Details - Add Virtual Machines', { tag: '@downstream' }, () => {
  test('should add virtual machines to an existing plan via the modal', async ({
    page,
    createCustomPlan,
    resourceManager,
  }) => {
    const testPlan = await createCustomPlan({
      virtualMachines: [{ folder: 'vm' }],
    });

    const planDetailsPage = new PlanDetailsPage(page);
    const planName = testPlan.metadata.name;
    const planNamespace = testPlan.metadata.namespace;

    // Remove the last VM from the plan via API so it becomes available for the "add" flow
    const plan = await resourceManager.fetchPlan(page, planName, planNamespace);
    const vms = plan?.spec?.vms ?? [];
    expect(vms.length).toBeGreaterThan(1);

    const removedVm = vms[vms.length - 1];
    const remainingVms = vms.slice(0, -1);

    const patchResult = await resourceManager.patchResource(page, {
      kind: 'Plan',
      resourceName: planName,
      namespace: planNamespace,
      patch: [{ op: 'replace', path: '/spec/vms', value: remainingVms }],
      patchType: 'json',
    });
    expect(patchResult).not.toBeNull();

    await test.step('1. Navigate to VM tab and verify Add button is enabled', async () => {
      await planDetailsPage.navigate(planName, planNamespace);
      await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
      await planDetailsPage.virtualMachinesTab.verifyTableLoaded();

      await expect(planDetailsPage.virtualMachinesTab.addVirtualMachinesButton).toBeVisible();
      await planDetailsPage.virtualMachinesTab.verifyAddVirtualMachinesButtonEnabled();
    });

    await test.step('2. Open modal, verify initial state and VM exclusion', async () => {
      const plannedVmName = await planDetailsPage.virtualMachinesTab.getFirstVMName();
      expect(plannedVmName).toBeTruthy();

      const modal = await planDetailsPage.virtualMachinesTab.clickAddVirtualMachines();

      await modal.verifyModalTitle();
      await modal.verifySaveButtonDisabled();
      await expect(modal.cancelButton).toBeVisible();

      // Already-planned VMs must not appear in the modal
      await modal.verifyVmNotInTable(plannedVmName);

      // The removed VM should be available
      await modal.verifyVmInTable(removedVm.name!);

      await modal.cancel();
    });

    await test.step('3. Select a VM, verify confirm enables, then cancel without saving', async () => {
      const initialRowCount = await planDetailsPage.virtualMachinesTab.getRowCount();

      const modal = await planDetailsPage.virtualMachinesTab.clickAddVirtualMachines();

      const modalRowCount = await modal.getRowCount();
      expect(modalRowCount).toBeGreaterThan(0);

      await modal.selectVirtualMachine(removedVm.name!);
      await modal.verifySaveButtonEnabled();

      await modal.cancel();

      // Verify the plan VM table row count is unchanged after cancel
      const afterCancelRowCount = await planDetailsPage.virtualMachinesTab.getRowCount();
      expect(afterCancelRowCount).toBe(initialRowCount);
    });

    await test.step('4. Add a VM via the modal (happy path)', async () => {
      const initialRowCount = await planDetailsPage.virtualMachinesTab.getRowCount();

      const modal = await planDetailsPage.virtualMachinesTab.clickAddVirtualMachines();

      await modal.selectVirtualMachine(removedVm.name!);
      await modal.save();

      await page.waitForLoadState('networkidle');
      await planDetailsPage.virtualMachinesTab.verifyTableLoaded();

      const afterAddRowCount = await planDetailsPage.virtualMachinesTab.getRowCount();
      expect(afterAddRowCount).toBe(initialRowCount + 1);

      await planDetailsPage.virtualMachinesTab.verifyRowIsVisible({ Name: removedVm.name! });

      // API-level verification
      const updatedPlan = await resourceManager.fetchPlan(page, planName, planNamespace);
      const planVmNames = (updatedPlan?.spec?.vms ?? []).map((vm) => vm.name);
      expect(planVmNames).toContain(removedVm.name);
    });

    await test.step('5. Verify the added VM is excluded from subsequent add operations', async () => {
      const modal = await planDetailsPage.virtualMachinesTab.clickAddVirtualMachines();

      await modal.verifyVmNotInTable(removedVm.name!);

      await modal.cancel();
    });

    await test.step('6. Verify button is disabled for non-editable plans (archived)', async () => {
      const archiveResult = await resourceManager.patchResource(page, {
        kind: 'Plan',
        resourceName: planName,
        namespace: planNamespace,
        patch: { spec: { archived: true } },
        patchType: 'merge',
      });
      expect(archiveResult).not.toBeNull();

      await planDetailsPage.navigate(planName, planNamespace);
      await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();

      await planDetailsPage.virtualMachinesTab.verifyAddVirtualMachinesButtonDisabled();
    });
  });
});
