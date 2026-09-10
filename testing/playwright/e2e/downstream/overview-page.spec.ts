import { expect, test } from '@playwright/test';

import { createTestNad } from '../../fixtures/helpers/resourceCreationHelpers';
import {
  ensureUnsetVirtV2vBaseline,
  expectPatchContains,
  initializeForkliftSettings,
  KNOWN_SETTINGS,
  type OriginalSettings,
  restoreForkliftSettings,
  SETTINGS_UI_DEFAULTS,
} from '../../fixtures/helpers/settingsHelpers';
import { OverviewPage } from '../../page-objects/OverviewPage/OverviewPage';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { ResourceManager } from '../../utils/resource-manager/ResourceManager';
import { V2_11_0, V2_12_0, V5_0_0 } from '../../utils/version/constants';
import { isVersionAtLeast, requireVersion } from '../../utils/version/version';

const INVALID_AAP_URL = 'not-a-url';
const VIRT_V2V_CUSTOM_MEMSIZE = 4096;
const VIRT_V2V_CUSTOM_SMP = 2;

test.describe('Overview Page - Health Tab', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);

  test('should navigate to Health tab and verify status cards render', async ({ page }) => {
    const overviewPage = new OverviewPage(page);

    await test.step('Navigate to the Overview page', async () => {
      await overviewPage.navigateDirectly();
    });

    await test.step('Navigate to the Health tab', async () => {
      await overviewPage.healthTab.navigateToHealthTab();
    });

    await test.step('Verify the Health tab is selected and URL contains /health', async () => {
      await overviewPage.healthTab.verifyHealthTabSelected();
    });

    await test.step('Verify Health and Conditions cards render with expected content', async () => {
      await overviewPage.healthTab.verifyCardsRender();
    });
  });
});

// Serial: Settings tests share one ForkliftController. The baseline edit test mutates
// CPU/memory/maxVmInFlight; the virt-v2v block mutates conversion fields. fullyParallel
// plus local workers would race if this suite were parallel.
test.describe.serial(
  'Overview Page - Settings',
  {
    tag: '@downstream',
  },
  () => {
    requireVersion(test, V2_11_0);

    const resourceManager = new ResourceManager();
    let originalSettings: OriginalSettings | null = null;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext({ ignoreHTTPSErrors: true });
      const page = await context.newPage();

      await createTestNad(resourceManager, {
        namespace: MTV_NAMESPACE,
      });

      await page.goto(process.env.BRIDGE_BASE_ADDRESS ?? process.env.BASE_ADDRESS ?? '/');
      originalSettings = await initializeForkliftSettings();

      await context.close();
    });

    test.afterAll(async ({ browser }) => {
      if (originalSettings) {
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage();
        await page.goto(process.env.BRIDGE_BASE_ADDRESS ?? process.env.BASE_ADDRESS ?? '/');
        const restored = await restoreForkliftSettings(originalSettings);
        if (!restored) {
          throw new Error('Failed to restore Forklift settings in afterAll');
        }
        await context.close();
      }
      await resourceManager.cleanupAll();
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

      if (isVersionAtLeast(V2_12_0)) {
        await test.step('Verify AAP settings fields are visible in read-only view', async () => {
          await expect(overviewPage.settingsTab.aapUrlField).toBeVisible();
          await expect(overviewPage.settingsTab.aapTokenSecretField).toBeVisible();
          await expect(overviewPage.settingsTab.aapTimeoutField).toBeVisible();
        });

        await test.step('Verify AAP fields are present in edit modal', async () => {
          await overviewPage.settingsTab.openSettingsEditModal();
          await overviewPage.settingsTab.settingsEditModal.verifyAapFieldsVisible();

          const aapUrl = await overviewPage.settingsTab.settingsEditModal.getAapUrlValue();
          expect(aapUrl).toBe('');

          const aapTimeout = await overviewPage.settingsTab.settingsEditModal.getAapTimeoutValue();
          expect(Number(aapTimeout)).toBe(0);

          await expect(overviewPage.settingsTab.settingsEditModal.saveButton).toBeDisabled();
          await overviewPage.settingsTab.settingsEditModal.cancel();
        });
      }
    });

    test.describe.serial('Reset to defaults and virt-v2v', () => {
      requireVersion(test, V5_0_0);

      test.beforeAll(async () => {
        const initialized = await initializeForkliftSettings();
        if (!initialized) {
          throw new Error('Failed to initialize ForkliftController settings');
        }
      });

      test.beforeEach(async () => {
        await ensureUnsetVirtV2vBaseline();
      });

      test('should show Default for unset virt-v2v settings and Reset in the edit modal', async ({
        page,
      }) => {
        const overviewPage = new OverviewPage(page);
        const { settingsTab } = overviewPage;

        await test.step('Navigate to Settings tab', async () => {
          await overviewPage.navigateToSettings();
        });

        await test.step('Verify unset virt-v2v values show Default and transfer network shows None', async () => {
          await settingsTab.expectVirtV2vUnsetOnCard();
          await expect(settingsTab.controllerTransferNetworkField).toContainText('None');
        });

        await test.step('Open edit modal and verify Reset plus virt-v2v fields at 0', async () => {
          await settingsTab.openSettingsEditModal();
          await settingsTab.settingsEditModal.verifyResetToDefaultsVisible();
          await settingsTab.settingsEditModal.verifyVirtV2vFieldsVisible();
          expect(await settingsTab.settingsEditModal.getVirtV2vMemsizeValue()).toBe(
            String(SETTINGS_UI_DEFAULTS.virtV2vMemsize),
          );
          expect(await settingsTab.settingsEditModal.getVirtV2vSmpValue()).toBe(
            String(SETTINGS_UI_DEFAULTS.virtV2vSmp),
          );
          await expect(settingsTab.settingsEditModal.saveButton).toBeDisabled();
          await settingsTab.settingsEditModal.cancel();
        });
      });

      test('should restore UI defaults when Reset to defaults is clicked', async ({ page }) => {
        const overviewPage = new OverviewPage(page);
        const { settingsTab } = overviewPage;

        await test.step('Navigate to Settings and open the edit modal', async () => {
          await overviewPage.navigateToSettings();
          await settingsTab.openSettingsEditModal();
        });

        await test.step('Change several fields then Reset to defaults', async () => {
          await settingsTab.settingsEditModal.setMaxVmInFlight(35);
          await settingsTab.settingsEditModal.selectControllerCpuLimit('2000m');
          await settingsTab.settingsEditModal.setVirtV2vMemsize(VIRT_V2V_CUSTOM_MEMSIZE);
          await settingsTab.settingsEditModal.setVirtV2vSmp(VIRT_V2V_CUSTOM_SMP);
          await settingsTab.settingsEditModal.resetToDefaults();
        });

        await test.step('Verify form matches defaultValuesMap and Save is enabled', async () => {
          // Reset restores product UI defaults (SETTINGS_UI_DEFAULTS), not KNOWN_SETTINGS
          // (test cluster baseline). Cancel below asserts the card still shows the baseline.
          expect(Number(await settingsTab.settingsEditModal.getMaxVmInFlightValue())).toBe(
            SETTINGS_UI_DEFAULTS.maxVmInFlight,
          );
          expect((await settingsTab.settingsEditModal.getControllerCpuLimitValue())?.trim()).toBe(
            SETTINGS_UI_DEFAULTS.cpuLimit,
          );
          expect(await settingsTab.settingsEditModal.getVirtV2vMemsizeValue()).toBe(
            String(SETTINGS_UI_DEFAULTS.virtV2vMemsize),
          );
          expect(await settingsTab.settingsEditModal.getVirtV2vSmpValue()).toBe(
            String(SETTINGS_UI_DEFAULTS.virtV2vSmp),
          );
          await expect(settingsTab.settingsEditModal.saveButton).toBeEnabled();
        });

        await test.step('Cancel without saving and verify the card is unchanged', async () => {
          await settingsTab.settingsEditModal.cancel();
          await expect(settingsTab.maxVmInFlightField).toContainText(
            String(KNOWN_SETTINGS.maxVmInFlight),
          );
          await settingsTab.expectVirtV2vUnsetOnCard();
        });
      });

      test('should persist custom virt-v2v values and remove them on Reset and Save', async ({
        page,
      }) => {
        const overviewPage = new OverviewPage(page);
        const { settingsTab } = overviewPage;

        await test.step('Navigate to Settings and save custom virt-v2v values', async () => {
          await overviewPage.navigateToSettings();
          await settingsTab.openSettingsEditModal();
          await settingsTab.settingsEditModal.setVirtV2vMemsize(VIRT_V2V_CUSTOM_MEMSIZE);
          await settingsTab.settingsEditModal.setVirtV2vSmp(VIRT_V2V_CUSTOM_SMP);
          const addPatch = await settingsTab.settingsEditModal.saveAndCapturePatches();
          expectPatchContains(addPatch, [
            {
              op: 'add',
              path: '/spec/virt_v2v_memsize',
              value: VIRT_V2V_CUSTOM_MEMSIZE,
            },
            {
              op: 'add',
              path: '/spec/virt_v2v_smp',
              value: VIRT_V2V_CUSTOM_SMP,
            },
          ]);
        });

        await test.step('Verify the Settings card shows the custom values', async () => {
          await expect(settingsTab.virtV2vMemsizeField).toContainText(
            String(VIRT_V2V_CUSTOM_MEMSIZE),
          );
          await expect(settingsTab.virtV2vSmpField).toContainText(String(VIRT_V2V_CUSTOM_SMP));
        });

        await test.step('Reset and Save, then verify REMOVE patch and Default on the card', async () => {
          await settingsTab.openSettingsEditModal();
          await settingsTab.settingsEditModal.resetToDefaults();
          const removePatch = await settingsTab.settingsEditModal.saveAndCapturePatches();
          expectPatchContains(removePatch, [
            { op: 'remove', path: '/spec/virt_v2v_memsize' },
            { op: 'remove', path: '/spec/virt_v2v_smp' },
          ]);
          expect(removePatch.some((operation) => operation.value === 0)).toBe(false);
          await settingsTab.expectVirtV2vUnsetOnCard();
        });
      });

      test('should disable Save when the AAP URL is invalid', async ({ page }) => {
        const overviewPage = new OverviewPage(page);
        const { settingsTab } = overviewPage;

        await test.step('Navigate to Settings and enter an invalid AAP URL', async () => {
          await overviewPage.navigateToSettings();
          await settingsTab.openSettingsEditModal();
          await settingsTab.settingsEditModal.setAapUrl(INVALID_AAP_URL);
        });

        await test.step('Verify validation message and Save stays disabled', async () => {
          await expect(settingsTab.settingsEditModal.modal).toContainText(
            'The URL is invalid. URL should include the schema, for example: https://aap.example.com.',
          );
          await expect(settingsTab.settingsEditModal.saveButton).toBeDisabled();
          await settingsTab.settingsEditModal.cancel();
        });
      });
    });
  },
);
