import { expect, test } from '@playwright/test';

import { createTestNad } from '../../fixtures/helpers/resourceCreationHelpers';
import {
  initializeForkliftSettings,
  KNOWN_SETTINGS,
  type OriginalSettings,
  restoreForkliftSettings,
} from '../../fixtures/helpers/settingsHelpers';
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
    let originalSettings: OriginalSettings | null = null;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext({ ignoreHTTPSErrors: true });
      const page = await context.newPage();

      await createTestNad(page, resourceManager, {
        namespace: MTV_NAMESPACE,
      });

      await page.goto(process.env.BRIDGE_BASE_ADDRESS ?? process.env.BASE_ADDRESS ?? '/');
      originalSettings = await initializeForkliftSettings(page);

      await context.close();
    });

    test.afterAll(async ({ browser }) => {
      if (originalSettings) {
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage();
        await page.goto(process.env.BRIDGE_BASE_ADDRESS ?? process.env.BASE_ADDRESS ?? '/');
        await restoreForkliftSettings(page, originalSettings);
        await context.close();
      }
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

      await test.step('Open settings edit modal', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
      });

      await test.step('Verify save button is disabled when no changes made', async () => {
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeDisabled();
      });

      await test.step('Cancel and close modal', async () => {
        await overviewPage.settingsTab.settingsEditModal.cancel();
      });

      await test.step('Edit max VM in flight', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
        const maxVmValue = await overviewPage.settingsTab.settingsEditModal.getMaxVmInFlightValue();
        expect(Number(maxVmValue)).toBe(KNOWN_SETTINGS.maxVmInFlight);

        await overviewPage.settingsTab.settingsEditModal.incrementMaxVmInFlight();
        const newValue = await overviewPage.settingsTab.settingsEditModal.getMaxVmInFlightValue();
        expect(Number(newValue)).toBe(KNOWN_SETTINGS.maxVmInFlight + 1);

        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeEnabled();
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Edit CPU limit', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
        const cpuValue =
          await overviewPage.settingsTab.settingsEditModal.getControllerCpuLimitValue();
        expect(cpuValue?.trim()).toBe(KNOWN_SETTINGS.cpuLimit);

        await overviewPage.settingsTab.settingsEditModal.selectControllerCpuLimit('2000m');
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeEnabled();
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Edit controller memory limit', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
        const memoryValue =
          await overviewPage.settingsTab.settingsEditModal.getControllerMemoryLimitValue();
        expect(memoryValue?.trim()).toBe(KNOWN_SETTINGS.controllerMemoryLimit);

        await overviewPage.settingsTab.settingsEditModal.selectControllerMemoryLimit('2000Mi');
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeEnabled();
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Edit inventory memory limit', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
        const inventoryMemValue =
          await overviewPage.settingsTab.settingsEditModal.getInventoryMemoryLimitValue();
        expect(inventoryMemValue?.trim()).toBe(KNOWN_SETTINGS.inventoryMemoryLimit);

        await overviewPage.settingsTab.settingsEditModal.selectInventoryMemoryLimit('2000Mi');
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeEnabled();
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Edit precopy interval', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
        const precopyValue =
          await overviewPage.settingsTab.settingsEditModal.getPrecopyIntervalValue();
        expect(precopyValue).toContain(String(KNOWN_SETTINGS.precopyInterval));

        await overviewPage.settingsTab.settingsEditModal.selectPrecopyInterval(30);
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeEnabled();
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Edit snapshot polling interval', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
        const snapshotValue =
          await overviewPage.settingsTab.settingsEditModal.getSnapshotPollingIntervalValue();
        expect(snapshotValue).toContain(String(KNOWN_SETTINGS.snapshotPollingInterval));

        await overviewPage.settingsTab.settingsEditModal.selectSnapshotPollingInterval(5);
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeEnabled();
        await overviewPage.settingsTab.settingsEditModal.save();
      });

      await test.step('Edit transfer network', async () => {
        await overviewPage.settingsTab.openSettingsEditModal();
        await overviewPage.settingsTab.settingsEditModal.toggleTransferNetworkValue();
        await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeEnabled();
        await overviewPage.settingsTab.settingsEditModal.save();
      });
    });
  },
);
