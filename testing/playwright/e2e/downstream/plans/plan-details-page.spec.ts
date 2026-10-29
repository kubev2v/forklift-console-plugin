import { expect } from '@playwright/test';

import { setupPlanDetailsPage } from '../../../fixtures/helpers/planDetailsHelpers';
import { sharedProviderFixtures as test } from '../../../fixtures/resourceFixtures';
import { DOWNSTREAM_PLAN_UI_TIMEOUT_MS } from '../../../utils/resource-manager/constants';
import { V2_10_5, V2_11_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Plan Details Navigation', { tag: '@downstream' }, () => {
  requireVersion(test, V2_10_5);
  test.describe.configure({ timeout: DOWNSTREAM_PLAN_UI_TIMEOUT_MS });

  test('should navigate to plan details and verify page content', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage, planName } = await setupPlanDetailsPage(page, testPlan);
    await planDetailsPage.verifyPlanDetailsURL(planName);
    await planDetailsPage.verifyNavigationTabs();
  });
});

test.describe('Plan Details - Delete', { tag: '@downstream' }, () => {
  requireVersion(test, V2_10_5);
  test.describe.configure({ timeout: DOWNSTREAM_PLAN_UI_TIMEOUT_MS });

  test('should delete the plan from the details page and return to the list', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { namespace, planDetailsPage, planName } = await setupPlanDetailsPage(page, testPlan);

    await planDetailsPage.deletePlan();

    await expect(page).toHaveURL(
      new RegExp(`/k8s/ns/${namespace}/forklift\\.konveyor\\.io~v1beta1~Plan$`, 'u'),
    );
    await expect(page.getByRole('link', { exact: true, name: planName })).not.toBeVisible();
  });
});

test.describe('Plan Details - VM Rename Validation', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);
  test.describe.configure({ timeout: DOWNSTREAM_PLAN_UI_TIMEOUT_MS });

  test('should handle VM rename validation - success and failure scenarios', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage, testData } = await setupPlanDetailsPage(page, testPlan);

    await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
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
    await planDetailsPage.virtualMachinesTab.saveEditVmWizard();
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
  requireVersion(test, V2_11_0);
  test.describe.configure({ timeout: DOWNSTREAM_PLAN_UI_TIMEOUT_MS });
  test('should edit Guest conversion mode', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    await planDetailsPage.settingsTab.navigateToGuestSection();

    // Step 1: Assert "Include guest conversion" is visible (initial state)
    await planDetailsPage.settingsTab.verifyGuestConversionModeText('Include guest conversion');

    // Step 2: Click edit icon next to Guest conversion mode
    await planDetailsPage.settingsTab.clickEditGuestConversionMode();

    // Step 3: Click "Skip guest conversion" checkbox and verify warning
    // Initially should be unchecked (Include guest conversion state)
    await planDetailsPage.settingsTab.guestConversionModal.verifySkipGuestConversionCheckbox(false);

    // Check the "Skip guest conversion" checkbox
    await planDetailsPage.settingsTab.guestConversionModal.toggleSkipGuestConversion(true);

    // Step 4: Verify warning message appears
    await planDetailsPage.settingsTab.guestConversionModal.verifySkipWarningMessage();

    // Step 5: Verify "Use compatibility mode" shows up and is checked
    // By default, compatibility mode should be enabled when skip is checked
    await planDetailsPage.settingsTab.guestConversionModal.verifyUseCompatibilityModeVisibleAndChecked();

    // Step 6: Save changes and verify detail items
    await planDetailsPage.settingsTab.guestConversionModal.save();

    // Verify the changes are reflected in the details section
    await planDetailsPage.settingsTab.verifyGuestConversionModeTexts([
      'Skip guest conversion',
      'Compatibility mode enabled',
    ]);

    // Step 7: Edit again and uncheck "Use compatibility mode" to verify new warning
    await planDetailsPage.settingsTab.clickEditGuestConversionMode();

    // Verify the previous settings are preserved
    await planDetailsPage.settingsTab.guestConversionModal.verifySkipGuestConversionCheckbox(true);
    await planDetailsPage.settingsTab.guestConversionModal.verifyUseCompatibilityModeVisibleAndChecked();

    // Uncheck "Use compatibility mode"
    await planDetailsPage.settingsTab.guestConversionModal.toggleUseCompatibilityMode(false);

    // Step 8: Verify new warning appears when compatibility mode is disabled
    await planDetailsPage.settingsTab.guestConversionModal.verifyCompatibilityWarningMessage();

    // Save the final changes
    await planDetailsPage.settingsTab.guestConversionModal.save();

    // Verify final state shows compatibility mode disabled
    await planDetailsPage.settingsTab.verifyGuestConversionModeTexts([
      'Skip guest conversion',
      'Compatibility mode disabled',
    ]);
  });
});

test.describe('Plan Details - Target Labels', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);
  test.describe.configure({ timeout: DOWNSTREAM_PLAN_UI_TIMEOUT_MS });
  test('should edit VM target labels', async ({ page, testPlan, testProvider: _testProvider }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    await planDetailsPage.settingsTab.navigateToTargetVmSection();

    // Step 1: Verify initial state (no labels)
    await planDetailsPage.settingsTab.verifyTargetLabelsCount(0);

    // Step 2: Click edit icon next to VM target labels
    await planDetailsPage.settingsTab.clickEditTargetLabels();

    // Step 3: Add a label
    await planDetailsPage.settingsTab.labelsModal.addLabel('environment', 'production');

    // Step 4: Save changes
    await planDetailsPage.settingsTab.labelsModal.save();

    // Step 5: Verify label is displayed
    await planDetailsPage.settingsTab.verifyTargetLabelsCount(1);
    await planDetailsPage.settingsTab.verifyTargetLabelsText('environment');

    // Step 6: Edit again and add another label
    await planDetailsPage.settingsTab.clickEditTargetLabels();
    await planDetailsPage.settingsTab.labelsModal.verifyLabelExists('environment', 'production');
    await planDetailsPage.settingsTab.labelsModal.addLabel('team', 'migration');

    // Step 7: Save and verify both labels
    await planDetailsPage.settingsTab.labelsModal.save();
    await planDetailsPage.settingsTab.verifyTargetLabelsCount(2);
    await planDetailsPage.settingsTab.verifyTargetLabelsText('environment');
    await planDetailsPage.settingsTab.verifyTargetLabelsText('team');

    // Step 8: Edit again and remove one label
    await planDetailsPage.settingsTab.clickEditTargetLabels();
    await planDetailsPage.settingsTab.labelsModal.deleteLabelByKey('team');

    // Step 9: Save and verify only one label remains
    await planDetailsPage.settingsTab.labelsModal.save();
    await planDetailsPage.settingsTab.verifyTargetLabelsCount(1);
    await planDetailsPage.settingsTab.verifyTargetLabelsText('environment');
  });
});

test.describe('Plan Details - Target Node Selector', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);
  test.describe.configure({ timeout: DOWNSTREAM_PLAN_UI_TIMEOUT_MS });
  test('should edit VM target node selector', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    await planDetailsPage.settingsTab.navigateToTargetVmSection();
    // Step 1: Verify initial state (no node selectors)
    await planDetailsPage.settingsTab.verifyTargetNodeSelectorCount(0);

    // Step 2: Click edit icon next to VM target node selector
    await planDetailsPage.settingsTab.clickEditTargetNodeSelector();

    // Step 3: Add a node selector
    await planDetailsPage.settingsTab.nodeSelectorModal.addNodeSelector(
      'kubernetes.io/arch',
      'amd64',
    );

    // Step 4: Save changes
    await planDetailsPage.settingsTab.nodeSelectorModal.save();

    // Step 5: Verify node selector is displayed
    await planDetailsPage.settingsTab.verifyTargetNodeSelectorCount(1);
    await planDetailsPage.settingsTab.verifyTargetNodeSelectorText('kubernetes.io/arch');

    // Step 6: Edit again and add another node selector
    await planDetailsPage.settingsTab.clickEditTargetNodeSelector();
    await planDetailsPage.settingsTab.nodeSelectorModal.verifyNodeSelectorExists(
      'kubernetes.io/arch',
      'amd64',
    );
    await planDetailsPage.settingsTab.nodeSelectorModal.addNodeSelector(
      'node-role.kubernetes.io/worker',
      '',
    );

    // Step 7: Save and verify both node selectors
    await planDetailsPage.settingsTab.nodeSelectorModal.save();
    await planDetailsPage.settingsTab.verifyTargetNodeSelectorCount(2);
    await planDetailsPage.settingsTab.verifyTargetNodeSelectorText('kubernetes.io/arch');
    await planDetailsPage.settingsTab.verifyTargetNodeSelectorText(
      'node-role.kubernetes.io/worker',
    );

    // Step 8: Edit again and remove one node selector
    await planDetailsPage.settingsTab.clickEditTargetNodeSelector();
    await planDetailsPage.settingsTab.nodeSelectorModal.deleteNodeSelectorByKey(
      'node-role.kubernetes.io/worker',
    );

    // Step 9: Save and verify only one node selector remains
    await planDetailsPage.settingsTab.nodeSelectorModal.save();
    await planDetailsPage.settingsTab.verifyTargetNodeSelectorCount(1);
    await planDetailsPage.settingsTab.verifyTargetNodeSelectorText('kubernetes.io/arch');
  });
});

test.describe('Plan Details - Target Affinity Rules', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);
  test.describe.configure({ timeout: DOWNSTREAM_PLAN_UI_TIMEOUT_MS });
  test('should edit VM target affinity rules', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    await planDetailsPage.settingsTab.navigateToTargetVmSection();
    // Step 1: Verify initial state (no affinity rules)
    await planDetailsPage.settingsTab.verifyTargetAffinityRulesCount(0);

    // Step 2: Click edit icon next to VM target affinity rules
    await planDetailsPage.settingsTab.clickEditTargetAffinity();

    // Step 3: Click "Add affinity rule" button
    await planDetailsPage.settingsTab.affinityModal.clickAddAffinityRule();

    // Step 4: Verify available affinity type options
    await planDetailsPage.settingsTab.affinityModal.verifyAffinityTypeOptions([
      'Node affinity',
      'Workload (pod) affinity',
      'Workload (pod) anti-affinity',
    ]);

    // Step 5: Select affinity type (Node affinity)
    await planDetailsPage.settingsTab.affinityModal.selectAffinityType('Node affinity');

    // Step 6: Verify available condition options
    await planDetailsPage.settingsTab.affinityModal.verifyConditionOptions([
      'Required during scheduling',
      'Preferred during scheduling',
    ]);

    // Step 7: Select rule type (Required during scheduling)
    await planDetailsPage.settingsTab.affinityModal.selectRuleType('Required during scheduling');

    // Step 8: Add an expression to make the rule valid
    await planDetailsPage.settingsTab.affinityModal.addExpression();
    await planDetailsPage.settingsTab.affinityModal.fillExpressionKey('kubernetes.io/hostname');
    await planDetailsPage.settingsTab.affinityModal.fillExpressionValue('worker-node-1');

    // Step 9: Save the affinity rule
    await planDetailsPage.settingsTab.affinityModal.saveAffinityRule();

    // Step 10: Verify rule exists in the list
    await planDetailsPage.settingsTab.affinityModal.verifyAffinityRuleExists();

    // Step 11: Apply rules and close modal
    await planDetailsPage.settingsTab.affinityModal.save();

    // Step 12: Verify affinity rule is displayed
    await planDetailsPage.settingsTab.verifyTargetAffinityRulesCount(1);

    // Step 13: Edit again and add another affinity rule
    await planDetailsPage.settingsTab.clickEditTargetAffinity();
    await planDetailsPage.settingsTab.affinityModal.clickAddAffinityRule();
    await planDetailsPage.settingsTab.affinityModal.selectAffinityType('Workload (pod) affinity');
    await planDetailsPage.settingsTab.affinityModal.selectRuleType('Preferred during scheduling');

    await planDetailsPage.settingsTab.affinityModal.fillWeight('50');
    await planDetailsPage.settingsTab.affinityModal.fillTopologyKey('kubernetes.io/hostname');
    await planDetailsPage.settingsTab.affinityModal.addExpression();
    await planDetailsPage.settingsTab.affinityModal.fillExpressionKey('app');
    await planDetailsPage.settingsTab.affinityModal.fillExpressionValue('database');
    await planDetailsPage.settingsTab.affinityModal.saveAffinityRule();

    // Step 14: Apply rules and verify multiple rules
    await planDetailsPage.settingsTab.affinityModal.save();
    await planDetailsPage.settingsTab.verifyTargetAffinityRulesCount(2);
  });
});

test.describe('Plan Details - Description', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);
  test.describe.configure({ timeout: DOWNSTREAM_PLAN_UI_TIMEOUT_MS });
  test('should edit plan description', async ({ page, testPlan, testProvider: _testProvider }) => {
    const { planDetailsPage, testData } = await setupPlanDetailsPage(page, testPlan);

    await test.step('Navigate to details tab', async () => {
      await planDetailsPage.detailsTab.navigateToDetailsTab();
    });

    await test.step('Verify initial description from testData', async () => {
      const initialDescription = testData.description ?? 'Test plan for automated testing';
      await planDetailsPage.detailsTab.verifyDescriptionText(initialDescription);
    });

    await test.step('Edit and update description', async () => {
      await planDetailsPage.waitForPlanEditable();
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
