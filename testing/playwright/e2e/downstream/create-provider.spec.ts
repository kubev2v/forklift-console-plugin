import { existsSync } from 'fs';
import { join } from 'path';

import { expect, test } from '@playwright/test';

const providersPath = join(__dirname, '../../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import * as providers from '../../../.providers.json';
import { CreateProviderPage } from '../../page-objects/CreateProviderPage';
import { ProviderDetailsPage } from '../../page-objects/ProviderDetailsPage';
import { ProvidersListPage } from '../../page-objects/ProvidersListPage';
import type { ProviderConfig, ProviderData } from '../../types/test-data';
import { ResourceManager } from '../../utils/ResourceManager';

test.describe.serial('Provider Creation Tests', () => {
  const resourceManager = new ResourceManager();

  let testProviderData: ProviderData = {
    name: '',
    type: 'vsphere',
    endpointType: 'vcenter',
    hostname: '',
    username: '',
    password: '',
    vddkInitImage: '',
    useVddkAioOptimization: false,
  };

  const providerName = `test-vsphere-provider-${Date.now()}`;

  test(
    'should create a new vsphere provider with VDDK AIO optimization enabled',
    {
      tag: '@downstream',
      timeout: 60000,
    },
    async ({ page }) => {
      const providersPage = new ProvidersListPage(page);
      const createProvider = new CreateProviderPage(page, resourceManager);
      const providerDetailsPage = new ProviderDetailsPage(page);

      const providerKey = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
      const providerConfig = (providers as Record<string, ProviderConfig>)[providerKey];

      testProviderData = {
        name: providerName,
        type: providerConfig.type,
        endpointType: providerConfig.endpoint_type ?? 'vcenter',
        hostname: providerConfig.api_url,
        username: providerConfig.username,
        password: providerConfig.password,
        vddkInitImage: providerConfig.vddk_init_image,
        useVddkAioOptimization: true, // Test with optimization enabled
      };

      await providersPage.navigateFromMainMenu();
      await providersPage.clickCreateProviderButton();
      await createProvider.waitForWizardLoad();
      await createProvider.fillAndSubmit(testProviderData);
      await providerDetailsPage.waitForPageLoad();
      await providerDetailsPage.verifyProviderDetails(testProviderData);

      // Verify the useVddkAioOptimization value is persisted in the provider spec
      const providerResource = await resourceManager.fetchProvider(page, providerName);
      expect(providerResource).not.toBeNull();
      expect(providerResource?.spec?.settings?.useVddkAioOptimization).toBe('true');
    },
  );

  test(
    'should create a new vsphere provider with VDDK AIO optimization disabled',
    {
      tag: '@downstream',
      timeout: 60000,
    },
    async ({ page }) => {
      const providersPage = new ProvidersListPage(page);
      const createProvider = new CreateProviderPage(page, resourceManager);
      const providerDetailsPage = new ProviderDetailsPage(page);

      const providerKey = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
      const providerConfig = (providers as Record<string, ProviderConfig>)[providerKey];

      const providerNameDisabled = `test-vsphere-provider-disabled-${Date.now()}`;

      const testProviderDataDisabled: ProviderData = {
        name: providerNameDisabled,
        type: providerConfig.type,
        endpointType: providerConfig.endpoint_type ?? 'vcenter',
        hostname: providerConfig.api_url,
        username: providerConfig.username,
        password: providerConfig.password,
        vddkInitImage: providerConfig.vddk_init_image,
        useVddkAioOptimization: false, // Test with optimization disabled
      };

      await providersPage.navigateFromMainMenu();
      await providersPage.clickCreateProviderButton();
      await createProvider.waitForWizardLoad();
      await createProvider.fillAndSubmit(testProviderDataDisabled);
      await providerDetailsPage.waitForPageLoad();
      await providerDetailsPage.verifyProviderDetails(testProviderDataDisabled);

      // Verify the useVddkAioOptimization value is persisted in the provider spec
      const providerResource = await resourceManager.fetchProvider(page, providerNameDisabled);
      expect(providerResource).not.toBeNull();
      // When disabled, the field might be undefined, 'false', or not present
      const aioOptimization = providerResource?.spec?.settings?.useVddkAioOptimization;
      expect(
        aioOptimization === undefined || aioOptimization === 'false' || aioOptimization === false,
      ).toBe(true);
    },
  );

  test.afterAll(async () => {
    // Cleanup: Delete the created provider
    await resourceManager.instantCleanup();
  });
});
