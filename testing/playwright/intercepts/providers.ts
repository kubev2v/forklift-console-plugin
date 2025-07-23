import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupProvidersIntercepts = async (page: Page) => {
  await page.route(API_ENDPOINTS.providers, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'forklift.konveyor.io/v1beta1',
        items: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Provider',
            metadata: {
              name: TEST_DATA.providers.source.name,
              namespace: 'openshift-mtv',
              uid: TEST_DATA.providers.source.uid,
            },
            spec: {
              type: TEST_DATA.providers.source.type,
              url: TEST_DATA.providers.source.url,
            },
            status: {
              phase: 'Ready',
              conditions: [
                {
                  type: 'Ready',
                  status: 'True',
                  message: 'The provider is ready.',
                },
              ],
            },
          },
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Provider',
            metadata: {
              name: TEST_DATA.providers.target.name,
              namespace: 'openshift-mtv',
              uid: TEST_DATA.providers.target.uid,
            },
            spec: {
              type: TEST_DATA.providers.target.type,
              url: TEST_DATA.providers.target.url,
            },
            status: {
              phase: 'Ready',
              conditions: [
                {
                  type: 'Ready',
                  status: 'True',
                  message: 'The provider is ready.',
                },
              ],
            },
          },
        ],
      }),
    });
  });
};
