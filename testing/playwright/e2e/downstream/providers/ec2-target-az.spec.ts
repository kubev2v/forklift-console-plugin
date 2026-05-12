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

const createEc2ProviderAndFetchSettings = async (
  page: Page,
  resourceManager: ResourceManager,
  overrides: Partial<ProviderData>,
): Promise<Record<string, string>> => {
  const createProvider = new CreateProviderPage(page, resourceManager);
  const testProviderData = createProviderData(ProviderType.EC2, EC2_KEY, overrides);

  await createProvider.navigate();
  await createProvider.waitForWizardLoad();
  await createProvider.fillAndSubmit(testProviderData);
  const detailsPage = new ProviderDetailsPage(page);
  await detailsPage.waitForPageLoad();
  await detailsPage.verifyProviderTitle(testProviderData.name);

  const providerResource = await resourceManager.fetchProvider(page, testProviderData.name);
  expect(providerResource).not.toBeNull();
  return (providerResource?.spec?.settings as Record<string, string>) ?? {};
};

test.describe('EC2 Provider target-az CR Verification', () => {
  requireVersion(test, V2_12_0);

  const resourceManager = new ResourceManager();

  test(
    'should set target-az in provider spec when auto-detect is disabled',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      test.skip(
        !hasProviderConfig(EC2_KEY),
        `Provider config '${EC2_KEY}' not found in .providers.json`,
      );

      const settings = await createEc2ProviderAndFetchSettings(page, resourceManager, {
        autoTargetCredentials: false,
        targetAz: 'us-east-2a',
        targetRegion: 'us-east-2',
      });

      expect(settings['target-az']).toBe('us-east-2a');
      expect(settings['target-region']).toBe('us-east-2');
    },
  );

  test(
    'should not set target-az when auto-detect is enabled',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      test.skip(
        !hasProviderConfig(EC2_KEY),
        `Provider config '${EC2_KEY}' not found in .providers.json`,
      );

      const settings = await createEc2ProviderAndFetchSettings(page, resourceManager, {
        autoTargetCredentials: true,
      });

      expect(settings.autoTargetCredentials).toBe('true');
      expect(settings['target-az']).toBeUndefined();
      expect(settings['target-region']).toBeUndefined();
    },
  );

  test.afterAll(async () => {
    await resourceManager.instantCleanup();
  });
});
