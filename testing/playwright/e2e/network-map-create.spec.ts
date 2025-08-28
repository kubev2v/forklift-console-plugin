import { test } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';
import { setupForkliftIntercepts } from '../intercepts';
import { NetworkMapCreatePage } from '../page-objects/NetworkMapCreatePage';
import { NetworkMapDetailsPage } from '../page-objects/NetworkMapDetailsPage';
import { NetworkMapsListPage } from '../page-objects/NetworkMapsListPage';

test.describe('Network Map - Create Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupForkliftIntercepts(page);
  });

  test('should create network map via form and navigate to details page', async ({ page }) => {
    const listPage = new NetworkMapsListPage(page);
    const createPage = new NetworkMapCreatePage(page);
    const detailsPage = new NetworkMapDetailsPage(page);

    const testNetworkMapName = 'test-create-network-map';

    // Navigate to network maps list and then to create form
    await listPage.navigateFromMainMenu();
    await listPage.clickCreateNetworkMapButton();
    await createPage.waitForPageLoad();

    // Fill all required fields
    await createPage.fillRequiredFields({
      mapName: testNetworkMapName,
      project: 'openshift-mtv',
      sourceProvider: TEST_DATA.providers.source.name,
      targetProvider: TEST_DATA.providers.target.name,
      sourceNetwork: 'test-vm-network',
      targetNetwork: 'Default network',
    });

    // Submit the form
    await createPage.submitForm(testNetworkMapName);

    // Verify we land on the details page
    await detailsPage.verifyNetworkMapDetailsPage({
      networkMapName: testNetworkMapName,
      sourceProvider: TEST_DATA.providers.source.name,
      targetProvider: TEST_DATA.providers.target.name,
    });
  });
});
