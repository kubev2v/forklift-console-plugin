import { expect } from '@playwright/test';

import { sharedProviderFixtures as test } from '../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';

test.describe('Plan Details Navigation', { tag: '@downstream' }, () => {
  test('should navigate to plan details and verify page content', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');

    const { name: planName, namespace } = testPlan.metadata;
    const planDetailsPage = new PlanDetailsPage(page);

    await planDetailsPage.navigate(planName, namespace);

    await planDetailsPage.verifyPlanTitle(planName);
    await planDetailsPage.verifyPlanDetailsURL(planName);
    await planDetailsPage.verifyNavigationTabs();
  });
});

test.describe('Plan Details - VM Rename Validation', { tag: '@downstream' }, () => {
  test('should handle VM rename validation - success and failure scenarios', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');

    const planDetailsPage = new PlanDetailsPage(page);

    const { name: planName, namespace } = testPlan.metadata;

    await planDetailsPage.navigate(planName, namespace);
    await planDetailsPage.verifyPlanTitle(planName);

    await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    const { testData } = testPlan;
    await planDetailsPage.virtualMachinesTab.verifyVirtualMachinesTab(testData);

    await planDetailsPage.virtualMachinesTab.enableColumn('Target name');

    const isTargetNameVisible =
      await planDetailsPage.virtualMachinesTab.isColumnVisible('Target name');
    expect(isTargetNameVisible).toBe(true);

    const originalVmName = testData.virtualMachines?.[0]?.sourceName ?? 'default-vm';

    const invalidNamesWithErrors = ['VM-With-Capitals', 'invalid@symbol'];

    for (const name of invalidNamesWithErrors) {
      await planDetailsPage.virtualMachinesTab.openRenameDialog(originalVmName);
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.clear();
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.waitFor({ state: 'attached' });
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.fill(name);
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.press('Tab');

      await expect(planDetailsPage.virtualMachinesTab.validationErrorMessage).toBeVisible();
      await expect(planDetailsPage.virtualMachinesTab.saveButton).toBeDisabled();

      await planDetailsPage.virtualMachinesTab.cancelButton.click();
      await expect(planDetailsPage.virtualMachinesTab.renameTargetNameInput).not.toBeVisible();

      await page.waitForTimeout(500);
    }

    const validNames = ['valid-name-123', 'test123'];

    for (const name of validNames) {
      await planDetailsPage.virtualMachinesTab.openRenameDialog(originalVmName);
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.clear();
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.waitFor({ state: 'attached' });
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.fill(name);
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.press('Tab');
      await expect(planDetailsPage.virtualMachinesTab.validationErrorMessage).not.toBeVisible();
      await expect(planDetailsPage.virtualMachinesTab.saveButton).toBeEnabled();

      await planDetailsPage.virtualMachinesTab.cancelButton.click();
      await expect(planDetailsPage.virtualMachinesTab.renameTargetNameInput).not.toBeVisible({
        timeout: 10000,
      });

      await page.waitForTimeout(500);
    }

    const finalValidName = 'renamed-vm-test';

    await planDetailsPage.virtualMachinesTab.openRenameDialog(originalVmName);
    await planDetailsPage.virtualMachinesTab.renameTargetNameInput.clear();
    await planDetailsPage.virtualMachinesTab.renameTargetNameInput.fill(finalValidName);

    await expect(planDetailsPage.virtualMachinesTab.saveButton).toBeEnabled();
    await planDetailsPage.virtualMachinesTab.saveButton.click();
    await expect(planDetailsPage.virtualMachinesTab.renameTargetNameInput).not.toBeVisible();

    const targetNameCell = await planDetailsPage.virtualMachinesTab.getTableCell(
      'Name',
      originalVmName,
      'Target name',
    );
    await expect(targetNameCell).toHaveText(finalValidName);

    await planDetailsPage.virtualMachinesTab.openRenameDialog(originalVmName);
    await expect(planDetailsPage.virtualMachinesTab.renameTargetNameInput).toHaveValue(
      finalValidName,
    );

    await planDetailsPage.virtualMachinesTab.cancelButton.click();
  });
});

test.describe('Plan Details - Guest Conversion Mode', { tag: '@downstream' }, () => {
  test('should edit Guest conversion mode', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');

    const planDetailsPage = new PlanDetailsPage(page);

    const { name: planName, namespace } = testPlan.metadata;

    await planDetailsPage.navigate(planName, namespace);
    await planDetailsPage.verifyPlanTitle(planName);

    // Navigate to Details tab to access guest conversion mode settings
    await planDetailsPage.detailsTab.navigateToDetailsTab();

    // Step 1: Assert "Include guest conversion" is visible (initial state)
    await planDetailsPage.detailsTab.verifyGuestConversionModeText('Include guest conversion');

    // Step 2: Click edit icon next to Guest conversion mode
    await planDetailsPage.detailsTab.clickEditGuestConversionMode();

    // Step 3: Click "Skip guest conversion" checkbox and verify warning
    // Initially should be unchecked (Include guest conversion state)
    await planDetailsPage.detailsTab.guestConversionModal.verifySkipGuestConversionCheckbox(false);

    // Check the "Skip guest conversion" checkbox
    await planDetailsPage.detailsTab.guestConversionModal.toggleSkipGuestConversion(true);

    // Step 4: Verify warning message appears
    await planDetailsPage.detailsTab.guestConversionModal.verifySkipWarningMessage();

    // Step 5: Verify "Use compatibility mode" shows up and is checked
    // By default, compatibility mode should be enabled when skip is checked
    await planDetailsPage.detailsTab.guestConversionModal.verifyUseCompatibilityModeVisibleAndChecked();

    // Step 6: Save changes and verify detail items
    await planDetailsPage.detailsTab.guestConversionModal.save();

    // Verify the changes are reflected in the details section
    await planDetailsPage.detailsTab.verifyGuestConversionModeTexts([
      'Skip guest conversion',
      'Compatibility mode enabled',
    ]);

    // Step 7: Edit again and uncheck "Use compatibility mode" to verify new warning
    await planDetailsPage.detailsTab.clickEditGuestConversionMode();

    // Verify the previous settings are preserved
    await planDetailsPage.detailsTab.guestConversionModal.verifySkipGuestConversionCheckbox(true);
    await planDetailsPage.detailsTab.guestConversionModal.verifyUseCompatibilityModeVisibleAndChecked();

    // Uncheck "Use compatibility mode"
    await planDetailsPage.detailsTab.guestConversionModal.toggleUseCompatibilityMode(false);

    // Step 8: Verify new warning appears when compatibility mode is disabled
    await planDetailsPage.detailsTab.guestConversionModal.verifyCompatibilityWarningMessage();

    // Save the final changes
    await planDetailsPage.detailsTab.guestConversionModal.save();

    // Verify final state shows compatibility mode disabled
    await planDetailsPage.detailsTab.verifyGuestConversionModeTexts([
      'Skip guest conversion',
      'Compatibility mode disabled',
    ]);
  });
});

test.describe('Plan Details - Target Labels', { tag: '@downstream' }, () => {
  test('should edit VM target labels', async ({ page, testPlan, testProvider: _testProvider }) => {
    if (!testPlan) throw new Error('testPlan is required');

    const planDetailsPage = new PlanDetailsPage(page);

    const { name: planName, namespace } = testPlan.metadata;

    await planDetailsPage.navigate(planName, namespace);
    await planDetailsPage.verifyPlanTitle(planName);

    // Navigate to Details tab
    await planDetailsPage.detailsTab.navigateToDetailsTab();

    // Step 1: Verify initial state (no labels)
    await planDetailsPage.detailsTab.verifyTargetLabelsCount(0);

    // Step 2: Click edit icon next to VM target labels
    await planDetailsPage.detailsTab.clickEditTargetLabels();

    // Step 3: Add a label
    await planDetailsPage.detailsTab.targetLabelsModal.addLabel('environment', 'production');

    // Step 4: Save changes
    await planDetailsPage.detailsTab.targetLabelsModal.save();

    // Step 5: Verify label is displayed
    await planDetailsPage.detailsTab.verifyTargetLabelsCount(1);
    await planDetailsPage.detailsTab.verifyTargetLabelsText('environment');

    // Step 6: Edit again and add another label
    await planDetailsPage.detailsTab.clickEditTargetLabels();
    await planDetailsPage.detailsTab.targetLabelsModal.verifyLabelExists(
      'environment',
      'production',
    );
    await planDetailsPage.detailsTab.targetLabelsModal.addLabel('team', 'migration');

    // Step 7: Save and verify both labels
    await planDetailsPage.detailsTab.targetLabelsModal.save();
    await planDetailsPage.detailsTab.verifyTargetLabelsCount(2);
    await planDetailsPage.detailsTab.verifyTargetLabelsText('environment');
    await planDetailsPage.detailsTab.verifyTargetLabelsText('team');

    // Step 8: Edit again and remove one label
    await planDetailsPage.detailsTab.clickEditTargetLabels();
    await planDetailsPage.detailsTab.targetLabelsModal.deleteLabelByKey('team');

    // Step 9: Save and verify only one label remains
    await planDetailsPage.detailsTab.targetLabelsModal.save();
    await planDetailsPage.detailsTab.verifyTargetLabelsCount(1);
    await planDetailsPage.detailsTab.verifyTargetLabelsText('environment');
  });
});

test.describe('Plan Details - Target Node Selector', { tag: '@downstream' }, () => {
  test('should edit VM target node selector', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');

    const planDetailsPage = new PlanDetailsPage(page);

    const { name: planName, namespace } = testPlan.metadata;

    await planDetailsPage.navigate(planName, namespace);
    await planDetailsPage.verifyPlanTitle(planName);

    // Navigate to Details tab
    await planDetailsPage.detailsTab.navigateToDetailsTab();
    // Step 1: Verify initial state (no node selectors)
    await planDetailsPage.detailsTab.verifyTargetNodeSelectorCount(0);

    // Step 2: Click edit icon next to VM target node selector
    await planDetailsPage.detailsTab.clickEditTargetNodeSelector();

    // Step 3: Add a node selector
    await planDetailsPage.detailsTab.targetNodeSelectorModal.addNodeSelector(
      'kubernetes.io/arch',
      'amd64',
    );

    // Step 4: Save changes
    await planDetailsPage.detailsTab.targetNodeSelectorModal.save();

    // Step 5: Verify node selector is displayed
    await planDetailsPage.detailsTab.verifyTargetNodeSelectorCount(1);
    await planDetailsPage.detailsTab.verifyTargetNodeSelectorText('kubernetes.io/arch');

    // Step 6: Edit again and add another node selector
    await planDetailsPage.detailsTab.clickEditTargetNodeSelector();
    await planDetailsPage.detailsTab.targetNodeSelectorModal.verifyNodeSelectorExists(
      'kubernetes.io/arch',
      'amd64',
    );
    await planDetailsPage.detailsTab.targetNodeSelectorModal.addNodeSelector(
      'node-role.kubernetes.io/worker',
      '',
    );

    // Step 7: Save and verify both node selectors
    await planDetailsPage.detailsTab.targetNodeSelectorModal.save();
    await planDetailsPage.detailsTab.verifyTargetNodeSelectorCount(2);
    await planDetailsPage.detailsTab.verifyTargetNodeSelectorText('kubernetes.io/arch');
    await planDetailsPage.detailsTab.verifyTargetNodeSelectorText('node-role.kubernetes.io/worker');

    // Step 8: Edit again and remove one node selector
    await planDetailsPage.detailsTab.clickEditTargetNodeSelector();
    await planDetailsPage.detailsTab.targetNodeSelectorModal.deleteNodeSelectorByKey(
      'node-role.kubernetes.io/worker',
    );

    // Step 9: Save and verify only one node selector remains
    await planDetailsPage.detailsTab.targetNodeSelectorModal.save();
    await planDetailsPage.detailsTab.verifyTargetNodeSelectorCount(1);
    await planDetailsPage.detailsTab.verifyTargetNodeSelectorText('kubernetes.io/arch');
  });
});

test.describe('Plan Details - Target Affinity Rules', { tag: '@downstream' }, () => {
  test('should edit VM target affinity rules', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');
    const planDetailsPage = new PlanDetailsPage(page);

    const { name: planName, namespace } = testPlan.metadata;

    await planDetailsPage.navigate(planName, namespace);
    await planDetailsPage.verifyPlanTitle(planName);

    // Navigate to Details tab
    await planDetailsPage.detailsTab.navigateToDetailsTab();
    // Step 1: Verify initial state (no affinity rules)
    await planDetailsPage.detailsTab.verifyTargetAffinityRulesCount(0);

    // Step 2: Click edit icon next to VM target affinity rules
    await planDetailsPage.detailsTab.clickEditTargetAffinity();

    // Step 3: Click "Add affinity rule" button
    await planDetailsPage.detailsTab.targetAffinityModal.clickAddAffinityRule();

    // Step 4: Verify available affinity type options
    await planDetailsPage.detailsTab.targetAffinityModal.verifyAffinityTypeOptions([
      'Node affinity',
      'Workload (pod) affinity',
      'Workload (pod) anti-affinity',
    ]);

    // Step 5: Select affinity type (Node affinity)
    await planDetailsPage.detailsTab.targetAffinityModal.selectAffinityType('Node affinity');

    // Step 6: Verify available condition options
    await planDetailsPage.detailsTab.targetAffinityModal.verifyConditionOptions([
      'Required during scheduling',
      'Preferred during scheduling',
    ]);

    // Step 7: Select rule type (Required during scheduling)
    await planDetailsPage.detailsTab.targetAffinityModal.selectRuleType(
      'Required during scheduling',
    );

    // Step 8: Add an expression to make the rule valid
    await planDetailsPage.detailsTab.targetAffinityModal.addExpression();
    await planDetailsPage.detailsTab.targetAffinityModal.fillExpressionKey(
      'kubernetes.io/hostname',
    );
    await planDetailsPage.detailsTab.targetAffinityModal.fillExpressionValue('worker-node-1');

    // Step 9: Save the affinity rule
    await planDetailsPage.detailsTab.targetAffinityModal.saveAffinityRule();

    // Step 10: Verify rule exists in the list
    await planDetailsPage.detailsTab.targetAffinityModal.verifyAffinityRuleExists();

    // Step 11: Apply rules and close modal
    await planDetailsPage.detailsTab.targetAffinityModal.save();

    // Step 12: Verify affinity rule is displayed
    await planDetailsPage.detailsTab.verifyTargetAffinityRulesCount(1);

    // Step 13: Edit again and add another affinity rule
    await planDetailsPage.detailsTab.clickEditTargetAffinity();
    await planDetailsPage.detailsTab.targetAffinityModal.clickAddAffinityRule();
    await planDetailsPage.detailsTab.targetAffinityModal.selectAffinityType(
      'Workload (pod) affinity',
    );
    await planDetailsPage.detailsTab.targetAffinityModal.selectRuleType(
      'Preferred during scheduling',
    );

    await planDetailsPage.detailsTab.targetAffinityModal.fillWeight('50');
    await planDetailsPage.detailsTab.targetAffinityModal.fillTopologyKey('kubernetes.io/hostname');
    await planDetailsPage.detailsTab.targetAffinityModal.addExpression();
    await planDetailsPage.detailsTab.targetAffinityModal.fillExpressionKey('app');
    await planDetailsPage.detailsTab.targetAffinityModal.fillExpressionValue('database');
    await planDetailsPage.detailsTab.targetAffinityModal.saveAffinityRule();

    // Step 14: Apply rules and verify multiple rules
    await planDetailsPage.detailsTab.targetAffinityModal.save();
    await planDetailsPage.detailsTab.verifyTargetAffinityRulesCount(2);
  });
});

test.describe('Plan Details - Description', { tag: '@downstream' }, () => {
  test('should edit plan description', async ({ page, testPlan, testProvider: _testProvider }) => {
    if (!testPlan) throw new Error('testPlan is required');

    const planDetailsPage = new PlanDetailsPage(page);

    const { name: planName, namespace } = testPlan.metadata;
    const { testData } = testPlan;

    await test.step('Navigate to plan details page', async () => {
      await planDetailsPage.navigate(planName, namespace);
      await planDetailsPage.verifyPlanTitle(planName);
      await planDetailsPage.detailsTab.navigateToDetailsTab();
    });

    await test.step('Verify initial description from testData', async () => {
      const initialDescription = testData.description ?? 'Test plan for automated testing';
      await planDetailsPage.detailsTab.verifyDescriptionText(initialDescription);
    });

    await test.step('Edit and update description', async () => {
      await planDetailsPage.detailsTab.clickEditDescription();
      const updatedDescription = 'Updated description for production migration plan';
      await planDetailsPage.detailsTab.editDescription(updatedDescription);
      await planDetailsPage.detailsTab.saveDescription();
      await planDetailsPage.detailsTab.verifyDescriptionText(updatedDescription);
    });

    await test.step('Edit and change to another description', async () => {
      await planDetailsPage.detailsTab.clickEditDescription();
      const anotherDescription = 'Final description for testing purposes';
      await planDetailsPage.detailsTab.editDescription(anotherDescription);
      await planDetailsPage.detailsTab.saveDescription();
      await planDetailsPage.detailsTab.verifyDescriptionText(anotherDescription);
    });

    await test.step('Clear description and verify empty state', async () => {
      await planDetailsPage.detailsTab.clickEditDescription();
      await planDetailsPage.detailsTab.editDescription('');
      await planDetailsPage.detailsTab.saveDescription();
      await planDetailsPage.detailsTab.verifyDescriptionText('None');
    });
  });
});
