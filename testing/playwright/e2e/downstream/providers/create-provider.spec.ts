import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const providersPath = join(__dirname, '../../../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import { CreateProviderPage } from '../../../page-objects/CreateProviderPage';
import { ProviderType } from '../../../types/enums';
import { ResourceManager } from '../../../utils/resource-manager/ResourceManager';

import { createProviderData, providerTestScenarios } from './creation-scenarios';

test.describe('Provider Creation Tests', () => {
  const resourceManager = new ResourceManager();

  providerTestScenarios.forEach(
    ({ scenarioName, providerType, providerKey, providerDataOverrides }) => {
      test(
        `should create a new ${providerType} provider: ${scenarioName}`,
        {
          tag: '@downstream',
        },
        async ({ page }) => {
          const createProvider = new CreateProviderPage(page, resourceManager);
          const testProviderData = createProviderData(
            providerType,
            providerKey,
            providerDataOverrides,
          );

          await test.step('Navigate to provider creation page', async () => {
            await createProvider.navigate();
          });

          await test.step('Create provider', async () => {
            await createProvider.create(testProviderData, true);
          });

          await test.step('Verify provider resource', async () => {
            const providerResource = await resourceManager.fetchProvider(
              page,
              testProviderData.name,
            );
            expect(providerResource).not.toBeNull();
            expect(providerResource?.spec?.type).toBe(providerType);

            if (testProviderData.useVddkAioOptimization) {
              expect(providerResource?.spec?.settings?.useVddkAioOptimization).toBe('true');
            }
            if (!testProviderData.useVddkAioOptimization) {
              const aioValue = providerResource?.spec?.settings?.useVddkAioOptimization;
              expect(aioValue === undefined || aioValue === 'false').toBe(true);
            }
          });
        },
      );
    },
  );

  test.afterAll(async () => {
    await resourceManager.instantCleanup();
  });

  test(
    'should verify Skip VDDK Setup and Skip Certificate Validation options for vSphere provider',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page, resourceManager);

      await test.step('Navigate to provider creation page', async () => {
        await createProvider.navigate();
      });

      await test.step('Select VMware vSphere provider type', async () => {
        await createProvider.selectProviderType(ProviderType.VSPHERE);
      });

      await test.step('Verify AIO checkbox is visible when VDDK is configured manually', async () => {
        await createProvider.vddkManualRadio.click();
        await expect(createProvider.vddkManualRadio).toBeChecked();
        await expect(createProvider.vddkAioCheckbox).toBeVisible();
        await expect(createProvider.vddkImageInput).toBeVisible();
      });

      await test.step('Click Skip VDDK setup and verify warning and hidden AIO checkbox', async () => {
        await createProvider.vddkSkipRadio.click();
        await expect(createProvider.vddkSkipRadio).toBeChecked();
        await expect(createProvider.vddkSkipWarning).toBeVisible();
        await expect(createProvider.vddkAioCheckbox).not.toBeVisible();
        await expect(createProvider.vddkImageInput).not.toBeVisible();
      });

      await test.step('Verify CA certificate section is visible by default', async () => {
        await expect(createProvider.certificateConfigureRadio).toBeChecked();
        await expect(createProvider.certificateUploadInput).toBeVisible();
      });

      await test.step('Click Skip certificate validation and verify CA certificate section is hidden', async () => {
        await createProvider.certificateSkipRadio.click();
        await expect(createProvider.certificateSkipRadio).toBeChecked();
        await expect(createProvider.certificateUploadInput).not.toBeVisible();
      });
    },
  );
});
