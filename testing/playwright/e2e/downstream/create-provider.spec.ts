import { existsSync } from 'fs';
import { join } from 'path';

import { expect, test } from '@playwright/test';

const providersPath = join(__dirname, '../../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import { CreateProviderPage } from '../../page-objects/CreateProviderPage';
import { EndpointType, ProviderType } from '../../types/enums';
import type { ProviderData } from '../../types/test-data';
import { getProviderConfig } from '../../utils/providers';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { ResourceManager } from '../../utils/resource-manager/ResourceManager';

const VSPHERE_KEY = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
const OVA_KEY = process.env.OVA_PROVIDER ?? 'ova';

interface ProviderTestScenario {
  scenarioName: string;
  providerType: ProviderType;
  providerKey: string;
  providerDataOverrides?: Partial<ProviderData>;
}

const createProviderData = (
  providerType: ProviderType,
  providerKey: string,
  overrides?: Partial<ProviderData>,
): ProviderData => {
  const providerConfig = getProviderConfig(providerKey);
  const uniqueId = crypto.randomUUID().slice(0, 8);

  const baseData: ProviderData = {
    name: `test-${providerType}-provider-${uniqueId}`,
    projectName: MTV_NAMESPACE,
    type: providerConfig.type,
    hostname: providerConfig.api_url,
  };

  if (providerType !== ProviderType.OVA) {
    baseData.username = providerConfig.username;
    baseData.password = providerConfig.password;
  }

  if (providerType === ProviderType.VSPHERE) {
    baseData.endpointType = providerConfig.endpoint_type ?? EndpointType.VCENTER;
    baseData.vddkInitImage = providerConfig.vddk_init_image;
  }

  return { ...baseData, ...overrides };
};

const providerTestScenarios: ProviderTestScenario[] = [
  {
    scenarioName: 'vSphere with VDDK AIO optimization enabled',
    providerType: ProviderType.VSPHERE,
    providerKey: VSPHERE_KEY,
    providerDataOverrides: { useVddkAioOptimization: true },
  },
  {
    scenarioName: 'vSphere with VDDK AIO optimization disabled',
    providerType: ProviderType.VSPHERE,
    providerKey: VSPHERE_KEY,
    providerDataOverrides: { useVddkAioOptimization: false },
  },
  {
    scenarioName: 'OVA provider',
    providerType: ProviderType.OVA,
    providerKey: OVA_KEY,
  },
];

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

            if (testProviderData.useVddkAioOptimization === true) {
              expect(providerResource?.spec?.settings?.useVddkAioOptimization).toBe('true');
            } else if (testProviderData.useVddkAioOptimization === false) {
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
});
