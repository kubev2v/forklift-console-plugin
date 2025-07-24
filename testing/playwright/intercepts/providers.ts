import type { Page } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';

export const setupProvidersIntercepts = async (page: Page) => {
  const providersResponse = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'ProviderList',
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
  };

  // URL patterns that work for both local (9000) and GitHub Actions (30080)
  // Namespaced providers endpoint
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/providers\?limit=\d+/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
    },
  );

  // All providers endpoint (cluster-wide)
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/providers\?limit=\d+/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
    },
  );

  // Additional variations to ensure we catch all patterns
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/.*\/providers.*/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
    },
  );

  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/providers.*/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
    },
  );
};
