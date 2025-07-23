import type { Page } from '@playwright/test';

export const setupDatastoresIntercepts = async (page: Page, sourceProviderType = 'vsphere') => {
  // Handle both single and double slash variations
  const endpoint = `**/forklift-inventory/providers/${sourceProviderType}/test-source-uid-1/datastores`;

  const responseBody = JSON.stringify([
    {
      id: 'test-datastore-1',
      parent: { kind: 'Folder', id: 'group-test-datastore' },
      path: '/test/datastore/test-datastore-1',
      revision: 212,
      name: 'test-datastore-1',
      selfLink: `providers/${sourceProviderType}/test-source-uid-1/datastores/test-datastore-1`,
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
