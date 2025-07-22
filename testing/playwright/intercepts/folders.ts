import type { Page } from '@playwright/test';

export const setupFoldersIntercepts = async (page: Page, sourceProviderType = 'vsphere') => {
  // Handle both single and double slash variations
  const endpoint = `**/forklift-inventory/providers/${sourceProviderType}/test-source-uid-1/folders?detail=4`;

  const responseBody = JSON.stringify([
    {
      id: 'test-folder-1',
      parent: { kind: 'Datacenter', id: 'test-datacenter-1' },
      path: '/test/folder/test-folder-1',
      revision: 1,
      name: 'Test Folder 1',
      selfLink: `providers/${sourceProviderType}/test-source-uid-1/folders/test-folder-1`,
      datacenter: 'test-datacenter-1',
      children: 0,
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
