/* eslint-disable no-console */
import type { Page } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';

export const setupProvidersIntercepts = async (page: Page) => {
  console.log('🔧 Setting up providers intercepts...');

  const providersResponse = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'ProviderList',
    metadata: {
      resourceVersion: '12345',
      continue: '',
      remainingItemCount: 0,
    },
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

  // Cluster-wide providers endpoint (handles ?limit=250)
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/providers(?:\?.*)?$/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED cluster-wide providers request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
    },
  );

  // Namespaced providers endpoint (handles ?limit=250)
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/[^/]+\/providers(?:\?.*)?$/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED namespaced providers request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
    },
  );

  // Individual Provider fetch endpoints
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/[^/]+\/providers\/[^/?]+$/,
    async (route) => {
      if (route.request().method() === 'GET') {
        const url = route.request().url();
        const providerName = url.split('/').pop();

        // Try to find matching provider from our mock data
        const provider = providersResponse.items.find(
          (prov) => prov.metadata.name === providerName,
        );

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(provider ?? providersResponse.items[0]),
        });
      }
    },
  );

  // Fallback catch-all for any missed provider calls (essential for GitHub Actions)
  await page.route('**/api/kubernetes/**/*providers*', async (route) => {
    const url = route.request().url();
    console.log('🔄 Fallback provider intercept:', url);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(providersResponse),
    });
  });

  console.log('✨ Providers intercepts setup complete');
};
