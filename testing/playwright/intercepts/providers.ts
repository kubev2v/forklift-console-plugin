/* eslint-disable no-console */
import type { Page } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';

export const setupProvidersIntercepts = async (page: Page) => {
  console.log('🔧 Setting up providers intercepts...');

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

  console.log('📦 Mock providers response prepared:', JSON.stringify(providersResponse, null, 2));

  // URL patterns that work for both local (9000) and GitHub Actions (30080)
  // Namespaced providers endpoint
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/providers\?limit=\d+/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED namespaced providers request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
      console.log(
        '✅ Responded to namespaced providers request with',
        providersResponse.items.length,
        'providers',
      );
    },
  );

  // All providers endpoint (cluster-wide)
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/providers\?limit=\d+/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED cluster-wide providers request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
      console.log(
        '✅ Responded to cluster-wide providers request with',
        providersResponse.items.length,
        'providers',
      );
    },
  );

  // Additional variations to ensure we catch all patterns
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/.*\/providers.*/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED general namespaced providers request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
      console.log('✅ Responded to general namespaced providers request');
    },
  );

  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/providers.*/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED general providers request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
      console.log('✅ Responded to general providers request');
    },
  );

  console.log('✨ Providers intercepts setup complete');
};
