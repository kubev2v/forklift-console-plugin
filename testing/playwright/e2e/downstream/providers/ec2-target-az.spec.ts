import { expect, type Page, test } from '@playwright/test';

import { CreateProviderPage } from '../../../page-objects/CreateProviderPage';
import { ProviderDetailsPage } from '../../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import { ProviderType } from '../../../types/enums';
import type { ProviderData } from '../../../types/test-data';
import { hasProviderConfig } from '../../../utils/providers';
import { ResourceManager } from '../../../utils/resource-manager/ResourceManager';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

import { createProviderData } from './creation-scenarios';

const EC2_KEY = process.env.EC2_PROVIDER ?? 'ec2';

const createAndNavigateToProvider = async (
  page: Page,
  createProvider: CreateProviderPage,
  providerData: ProviderData,
): Promise<void> => {
  await createProvider.navigate();
  await createProvider.waitForWizardLoad();
  await createProvider.fillAndSubmit(providerData);
  const detailsPage = new ProviderDetailsPage(page);
  await detailsPage.waitForPageLoad();
  await detailsPage.verifyProviderTitle(providerData.name);
};

const fetchProviderSettings = async (
  page: Page,
  resourceManager: ResourceManager,
  providerName: string,
): Promise<Record<string, string> | undefined> => {
  const providerResource = await resourceManager.fetchProvider(page, providerName);
  expect(providerResource).not.toBeNull();
  return providerResource?.spec?.settings as Record<string, string> | undefined;
};

test.describe('EC2 Provider target-az CR Verification', () => {
  requireVersion(test, V2_12_0);

  if (!hasProviderConfig(EC2_KEY)) {
    test.skip();
  }

  const resourceManager = new ResourceManager();

  test(
    'should set target-az in provider spec when auto-detect is disabled',
    { tag: '@downstream' },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page, resourceManager);
      const testProviderData = createProviderData(ProviderType.EC2, EC2_KEY, {
        autoTargetCredentials: false,
        targetAz: 'us-east-2a',
        targetRegion: 'us-east-2',
      });

      await test.step('Navigate and create EC2 provider (manual target AZ / region)', async () => {
        await createAndNavigateToProvider(page, createProvider, testProviderData);
      });

      await test.step('Verify provider CR settings include target-az and target-region', async () => {
        const settings = await fetchProviderSettings(page, resourceManager, testProviderData.name);
        expect(settings?.['target-az']).toBe('us-east-2a');
        expect(settings?.['target-region']).toBe('us-east-2');
      });
    },
  );

  test(
    'should not set target-az when auto-detect is enabled',
    { tag: '@downstream' },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page, resourceManager);
      const testProviderData = createProviderData(ProviderType.EC2, EC2_KEY, {
        autoTargetCredentials: true,
      });

      await test.step('Navigate and create EC2 provider (auto-detect target)', async () => {
        await createAndNavigateToProvider(page, createProvider, testProviderData);
      });

      await test.step('Verify autoTargetCredentials and absence of target-az and target-region', async () => {
        const settings = await fetchProviderSettings(page, resourceManager, testProviderData.name);
        expect(settings?.autoTargetCredentials).toBe('true');
        expect(settings?.['target-az']).toBeUndefined();
        expect(settings?.['target-region']).toBeUndefined();
      });
    },
  );

  test.afterAll(async () => {
    await resourceManager.instantCleanup();
  });
});
