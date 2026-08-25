import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupHostsIntercepts = async (page: Page, sourceProviderType = 'vsphere') => {
  const endpoint = API_ENDPOINTS.hosts(sourceProviderType, TEST_DATA.providers.source.uid);

  const responseBody = JSON.stringify([
    {
      cluster: 'test-cluster-1',
      datastores: ['test-datastore-1', 'test-datastore-2'],
      id: 'test-host-1',
      inMaintenance: false,
      name: 'test-host-1.example.com',
      networks: ['test-network-1', 'test-network-2'],
      parent: { id: 'test-cluster-1', kind: 'Cluster' },
      path: '/test/host/test-host-1.example.com/test-host-1.example.com',
      revision: 2,
      selfLink: `providers/${sourceProviderType}/test-source-uid-1/hosts/test-host-1`,
      status: 'green',
    },
    {
      cluster: 'test-cluster-1',
      datastores: ['test-datastore-1', 'test-datastore-2'],
      id: 'test-host-2',
      inMaintenance: false,
      name: 'test-host-2.example.com',
      networks: ['test-network-1', 'test-network-2'],
      parent: { id: 'test-cluster-1', kind: 'Cluster' },
      path: '/test/host/test-host-2.example.com/test-host-2.example.com',
      revision: 2,
      selfLink: `providers/${sourceProviderType}/test-source-uid-1/hosts/test-host-2`,
      status: 'green',
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
