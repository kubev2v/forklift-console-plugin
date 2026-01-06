import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const providersPath = join(__dirname, '../../../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import { CreateProviderPage } from '../../../page-objects/CreateProviderPage';
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
