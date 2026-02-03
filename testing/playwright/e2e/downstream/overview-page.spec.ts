import { expect, test } from '@playwright/test';

import { createTestNad } from '../../fixtures/helpers/resourceCreationHelpers';
import { OverviewPage } from '../../page-objects/OverviewPage';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { ResourceManager } from '../../utils/resource-manager/ResourceManager';

test.describe(
  'Overview Page - Settings',
  {
    tag: '@downstream',
  },
  () => {
    const resourceManager = new ResourceManager();

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext({ ignoreHTTPSErrors: true });
      const page = await context.newPage();

      await createTestNad(page, resourceManager, {
        namespace: MTV_NAMESPACE,
      });

      await context.close();
    });

    test.afterAll(async () => {
      await resourceManager.instantCleanup();
    });

    test('should navigate to settings tab, edit settings, and verify changes', async ({ page }) => {
      const overviewPage = new OverviewPage(page);

      await test.step('Navigate to Settings tab', async () => {
        await overviewPage.navigateToSettings();
      });

      await test.step('Verify Settings tab is visible', async () => {
        await expect(overviewPage.settingsTab.settingsTab).toBeVisible();
      });

      await test.step('Verify edit button is visible', async () => {
        await expect(overviewPage.settingsTab.settingsEditButton).toBeVisible();
      });

      await test.step('Verify transfer network field is visible', async () => {
        await expect(overviewPage.settingsTab.controllerTransferNetworkField).toBeVisible();
      });

      await test.step('Open settings edit modal', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
      });

      await test.step('Verify save button is disabled when no changes made', async () => {
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeDisabled();
      });

      await test.step('Cancel and close modal', async () => {
        await overviewPage.settingsTab.settingsEditModal.cancel();
      });

      await test.step('Open settings edit modal for max VM in flight', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
      });

      let initialMaxVmValue = '';
      await test.step('Get initial max VM in flight value', async () => {
        initialMaxVmValue =
          await overviewPage.settingsTab.settingsEditModal.getMaxVmInFlightValue();
      });

      await test.step('Increment max VM in flight', async () => {
        await overviewPage.settingsTab.settingsEditModal.incrementMaxVmInFlight();
      });

      await test.step('Verify max VM in flight value changed', async () => {
        const newValue = await overviewPage.settingsTab.settingsEditModal.getMaxVmInFlightValue();
        expect(Number(newValue)).toBe(Number(initialMaxVmValue) + 1);
      });

      await test.step('Verify save button is enabled after max VM change', async () => {
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeEnabled();
      });

      await test.step('Save max VM in flight change', async () => {
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Revert max VM in flight to original value', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
        await overviewPage.settingsTab.settingsEditModal.decrementMaxVmInFlight();
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Open settings edit modal for CPU limit', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
      });

      let initialCpuValue: string | null = null;
      await test.step('Get initial CPU limit value', async () => {
        initialCpuValue =
          await overviewPage.settingsTab.settingsEditModal.getControllerCpuLimitValue();
      });

      await test.step('Change CPU limit to 2000m', async () => {
        await overviewPage.settingsTab.settingsEditModal.selectControllerCpuLimit('2000m');
      });

      await test.step('Verify save button is enabled after CPU limit change', async () => {
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeEnabled();
      });

      await test.step('Save CPU limit change', async () => {
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Revert CPU limit to original value', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
        await overviewPage.settingsTab.settingsEditModal.selectControllerCpuLimit(
          initialCpuValue?.trim() ?? '500m',
        );
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Open settings edit modal for precopy interval', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
      });

      await test.step('Change precopy interval to 30min', async () => {
        await overviewPage.settingsTab.settingsEditModal.selectPrecopyInterval(30);
      });

      await test.step('Verify save button is enabled after precopy interval change', async () => {
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeEnabled();
      });

      await test.step('Save precopy interval change', async () => {
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Revert precopy interval to default (60min)', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
        await overviewPage.settingsTab.settingsEditModal.selectPrecopyInterval(60);
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Open settings edit modal for transfer network', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
      });

      await test.step('Toggle transfer network value', async () => {
        await overviewPage.settingsTab.settingsEditModal.toggleTransferNetworkValue();
      });

      await test.step('Verify save button is enabled after transfer network change', async () => {
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeEnabled();
      });

      await test.step('Save transfer network change', async () => {
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Revert transfer network to original value', async () => {
        await overviewPage.settingsTab.editAndSaveTransferNetwork();
      });
    });
  },
);
