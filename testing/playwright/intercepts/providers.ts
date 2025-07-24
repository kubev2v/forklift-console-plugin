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

  // CRITICAL: Add the namespaced endpoint that should be called with namespace='openshift-mtv'
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/providers\?limit=\d+/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED openshift-mtv namespaced providers request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
      console.log('✅ Responded to openshift-mtv namespaced providers request');
    },
  );

  // URL patterns that work for both local (9000) and GitHub Actions (30080)
  // Namespaced providers endpoint (any namespace)
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/.*\/providers\?limit=\d+/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED namespaced providers request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
      console.log('✅ Responded to namespaced providers request');
    },
  );

  // All providers endpoint (cluster-wide) - this is what we're currently seeing
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/providers\?limit=\d+/,
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

  // Individual Provider fetch endpoints to prevent 404 errors
  // Based on GitHub Actions logs showing 404s for specific provider fetches
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/providers\/test-source-provider$/,
    async (route) => {
      if (route.request().method() === 'GET') {
        const url = route.request().url();
        console.log('🔧 INTERCEPTED Source Provider fetch:', url);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(providersResponse.items[0]), // Return the source provider
        });

        console.log('✅ Responded to Source Provider fetch with mock data');
      }
    },
  );

  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/providers\/test-target-provider$/,
    async (route) => {
      if (route.request().method() === 'GET') {
        const url = route.request().url();
        console.log('🔧 INTERCEPTED Target Provider fetch:', url);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(providersResponse.items[1]), // Return the target provider
        });

        console.log('✅ Responded to Target Provider fetch with mock data');
      }
    },
  );

  // Generic catch-all for any other provider fetch requests
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/providers\/[\w-]+$/,
    async (route) => {
      if (route.request().method() === 'GET') {
        const url = route.request().url();
        const providerName = url.split('/').pop();
        console.log('🔧 INTERCEPTED Generic Provider fetch:', url, 'for provider:', providerName);

        // Try to find matching provider from our mock data
        const provider = providersResponse.items.find(
          (prov) => prov.metadata.name === providerName,
        );

        if (provider) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(provider),
          });
          console.log(
            '✅ Responded to Generic Provider fetch with matched provider:',
            providerName,
          );
        } else {
          // If no match, return the first provider as fallback
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(providersResponse.items[0]),
          });
          console.log(
            '✅ Responded to Generic Provider fetch with fallback provider for:',
            providerName,
          );
        }
      }
    },
  );

  console.log('✨ Providers intercepts setup complete');
};
