import { existsSync } from 'fs';
import { join } from 'path';

import { expect, test } from '@playwright/test';

const providersPath = join(__dirname, '../../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import { CreateProviderPage } from '../../page-objects/CreateProviderPage';
import type { ProviderData } from '../../types/test-data';
import { getProviderConfig } from '../../utils/providers';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { ResourceManager } from '../../utils/resource-manager/ResourceManager';

const createProviderData = ({
  useVddkAioOptimization,
}: {
  useVddkAioOptimization: boolean;
}): ProviderData => {
  const providerKey = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
  const providerConfig = getProviderConfig(providerKey);
  const suffix = useVddkAioOptimization ? 'enabled' : 'disabled';

  return {
    name: `test-vsphere-provider-${suffix}-${crypto.randomUUID().slice(0, 8)}`,
    projectName: MTV_NAMESPACE,
    type: providerConfig.type,
    endpointType: providerConfig.endpoint_type ?? 'vcenter',
    hostname: providerConfig.api_url,
    username: providerConfig.username,
    password: providerConfig.password,
    vddkInitImage: providerConfig.vddk_init_image,
    useVddkAioOptimization,
  };
};

test.describe('Provider Creation Tests', () => {
  const resourceManager = new ResourceManager();

  test(
    'should create a new vsphere provider with VDDK AIO optimization enabled',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page, resourceManager);
      const testProviderData = createProviderData({ useVddkAioOptimization: true });

      await createProvider.navigate();
      await createProvider.create(testProviderData, true);

      // Verify the useVddkAioOptimization value is persisted in the provider spec
      const providerResource = await resourceManager.fetchProvider(page, testProviderData.name);
      expect(providerResource).not.toBeNull();
      expect(providerResource?.spec?.settings?.useVddkAioOptimization).toBe('true');
    },
  );

  test(
    'should create a new vsphere provider with VDDK AIO optimization disabled',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page, resourceManager);
      const testProviderData = createProviderData({ useVddkAioOptimization: false });

      await createProvider.navigate();
      await createProvider.create(testProviderData, true);

      // Verify the useVddkAioOptimization value is persisted in the provider spec
      const providerResource = await resourceManager.fetchProvider(page, testProviderData.name);
      expect(providerResource).not.toBeNull();
      // When disabled, the field might be undefined, 'false', or not present
      const aioOptimization = providerResource?.spec?.settings?.useVddkAioOptimization;
      expect(aioOptimization === undefined || aioOptimization === 'false').toBe(true);
    },
  );

  test(
    'should create a new OVA provider',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page, resourceManager);

      // Get OVA provider configuration
      const ovaProviderKey = process.env.OVA_PROVIDER ?? 'ova-nfs';
      const ovaProviderConfig = getProviderConfig(ovaProviderKey);

      const testProviderData: ProviderData = {
        name: `test-ova-provider-${crypto.randomUUID().slice(0, 8)}`,
        projectName: MTV_NAMESPACE,
        type: ovaProviderConfig.type,
        hostname: ovaProviderConfig.api_url,
      };

      await createProvider.navigate();
      await createProvider.create(testProviderData, true);

      // Verify the provider resource was created
      const providerResource = await resourceManager.fetchProvider(page, testProviderData.name);
      expect(providerResource).not.toBeNull();
      expect(providerResource?.spec?.type).toBe('ova');
      expect(providerResource?.spec?.url).toBe(testProviderData.hostname);
    },
  );

  test.afterAll(async () => {
    // Cleanup: Delete the created provider
    await resourceManager.instantCleanup();
  });
});
