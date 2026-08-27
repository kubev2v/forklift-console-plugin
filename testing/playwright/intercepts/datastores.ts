import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupDatastoresIntercepts = async (page: Page, sourceProviderType = 'vsphere') => {
  const endpoint = API_ENDPOINTS.datastores(sourceProviderType, TEST_DATA.providers.source.uid);

  const responseBody = JSON.stringify([
    {
      id: 'test-datastore-1',
      name: 'test-datastore-1',
      parent: { id: 'group-test-datastore', kind: 'Folder' },
      path: '/test/datastore/test-datastore-1',
      revision: 212,
      selfLink: `providers/${sourceProviderType}/test-source-uid-1/datastores/test-datastore-1`,
    },
  ]);

  await page.route(endpoint, async (route) => {
    await route.fulfill({
      body: responseBody,
      contentType: 'application/json',
      status: 200,
    });
  });
};
