import type { Page } from '@playwright/test';

import { API_ENDPOINTS } from '../fixtures/test-data';

export const setupTargetProviderNamespacesIntercepts = async (
  page: Page,
  targetProviderId = 'test-target-uid-1',
) => {
  const endpoint = API_ENDPOINTS.targetNamespaces(targetProviderId);
  await page.route(endpoint, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          name: 'default',
          uid: 'default-uid',
        },
        {
          name: 'test-target-project',
          uid: 'test-target-project-uid',
        },
        {
          name: 'openshift-mtv',
          uid: 'openshift-mtv-uid',
        },
      ]),
    });
  });
};
