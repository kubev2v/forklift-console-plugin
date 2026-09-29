import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';

import { CreateProviderPage } from '../../../page-objects/CreateProviderPage';
import { ProviderType } from '../../../types/enums';
import type { ProviderData } from '../../../types/test-data';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { ResourceManager } from '../../../utils/resource-manager/ResourceManager';
import { V2_13_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const DUMMY_PASSWORD = 'password123';
const DUMMY_PRISM_URL = 'https://prism.example.com:9440';
const DUMMY_USERNAME = 'admin';

const PRISM_TYPES = ['element', 'central'] as const;

type NutanixPrismTypeName = (typeof PRISM_TYPES)[number];

const buildDummyNutanixProvider = (prismType: NutanixPrismTypeName): ProviderData => {
  const uniqueId = randomUUID().slice(0, 8);

  return {
    hostname: DUMMY_PRISM_URL,
    name: `test-nutanix-${prismType}-${uniqueId}`,
    password: DUMMY_PASSWORD,
    prismType,
    projectName: MTV_NAMESPACE,
    type: ProviderType.NUTANIX,
    username: DUMMY_USERNAME,
  };
};

test.describe('Nutanix prism type persistence', () => {
  requireVersion(test, V2_13_0);

  const resourceManager = new ResourceManager();

  for (const prismType of PRISM_TYPES) {
    test(
      `should store prismType ${prismType} without a reachable Prism`,
      { tag: '@downstream' },
      async ({ page }) => {
        const createProvider = new CreateProviderPage(page, resourceManager);
        const providerData = buildDummyNutanixProvider(prismType);

        const providerDetailsPage =
          await test.step('Create the provider without waiting for Ready', async () => {
            await createProvider.navigate();
            return createProvider.create(providerData, false);
          });

        await test.step('Verify the provider spec stores the selected prism type', async () => {
          const providerResource = await resourceManager.fetchProvider(providerData.name);
          expect(providerResource?.spec?.type).toBe(ProviderType.NUTANIX);
          expect(providerResource?.spec?.settings?.prismType).toBe(prismType);
        });

        await test.step('Delete the provider', async () => {
          await providerDetailsPage.deleteProvider(providerData.name);
          await expect(
            page.getByRole('link', { exact: true, name: providerData.name }),
          ).not.toBeVisible();

          const providerResource = await resourceManager.fetchProvider(providerData.name);
          expect(providerResource).toBeNull();
        });
      },
    );
  }

  test.afterAll(async () => {
    await resourceManager.cleanupAll();
  });
});
