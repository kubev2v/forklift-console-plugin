import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupHostsIntercepts = async (page: Page, sourceProviderType = 'vsphere') => {
  const endpoint = API_ENDPOINTS.hosts(sourceProviderType, TEST_DATA.providers.source.uid);

  const responseBody = JSON.stringify([
    {
      id: 'test-host-1',
      parent: { kind: 'Cluster', id: 'test-cluster-1' },
      path: '/test/host/test-host-1.example.com/test-host-1.example.com',
      revision: 2,
      name: 'test-host-1.example.com',
      selfLink: `providers/${sourceProviderType}/test-source-uid-1/hosts/test-host-1`,
      cluster: 'test-cluster-1',
      status: 'green',
      inMaintenance: false,
      networks: ['test-network-1', 'test-network-2'],
      datastores: ['test-datastore-1', 'test-datastore-2'],
    },
  ]);

  await page.route(endpoint, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: responseBody,
    });
  });
};
