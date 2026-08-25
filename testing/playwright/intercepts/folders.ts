import type { Page } from '@playwright/test';

export const setupFoldersIntercepts = async (page: Page, sourceProviderType = 'vsphere') => {
  // Handle both single and double slash variations
  const endpoint = `**/forklift-inventory/providers/${sourceProviderType}/test-source-uid-1/folders?detail=4`;

  const responseBody = JSON.stringify([
    {
      children: 0,
      datacenter: 'test-datacenter-1',
      id: 'test-folder-1',
      name: 'Test Folder 1',
      parent: { id: 'test-datacenter-1', kind: 'Datacenter' },
      path: '/test/folder/test-folder-1',
      revision: 1,
      selfLink: `providers/${sourceProviderType}/test-source-uid-1/folders/test-folder-1`,
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
