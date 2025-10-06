import { expect, test } from '@playwright/test';

import { TEST_DATA } from '../../fixtures/test-data';
import { setupForkliftIntercepts } from '../../intercepts';
import { NetworkMapCreatePage } from '../../page-objects/NetworkMapCreatePage';
import { NetworkMapDetailsPage } from '../../page-objects/NetworkMapDetailsPage';
import { NetworkMapsListPage } from '../../page-objects/NetworkMapsListPage';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';

test.describe(
  'Network Maps',
  {
    tag: '@upstream',
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await setupForkliftIntercepts(page);
    });

    test('should create network map via form', async ({ page }) => {
      const networkMapsListPage = new NetworkMapsListPage(page);
      const networkMapCreatePage = new NetworkMapCreatePage(page);
      const networkMapDetailsPage = new NetworkMapDetailsPage(page);

      await networkMapsListPage.navigate();
      await networkMapsListPage.clickCreateWithFormButton();

      const mapName = 'test-network-map';

      // Fill required fields
      await networkMapCreatePage.fillRequiredFields({
        mapName,
        project: MTV_NAMESPACE,
        sourceProvider: TEST_DATA.providers.source.name,
        targetProvider: TEST_DATA.providers.target.name,
        sourceNetwork: TEST_DATA.networks[0].name,
        targetNetwork: 'Default network',
      });
      await expect(networkMapCreatePage.createButton).toBeEnabled();

      // Submit form
      await networkMapCreatePage.submitForm(mapName);

      // Verify Network details page
      await networkMapDetailsPage.verifyNetworkMapDetailsPage({
        networkMapName: mapName,
        sourceProvider: TEST_DATA.providers.source.name,
        targetProvider: TEST_DATA.providers.target.name,
        mappings: [{ sourceNetwork: TEST_DATA.networks[0].name, targetNetwork: 'Default network' }],
      });
    });
  },
);
