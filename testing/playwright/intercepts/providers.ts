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

  console.log('📦 Mock providers response prepared:', JSON.stringify(providersResponse, null, 2));

  // 🚨 DEBUGGING INTERCEPTOR - Catch ALL provider API calls to see what's being called
  // Note: Commented out to avoid interference, will add catch-all at end instead
  // await page.route('**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/**', async (route) => {
  //   const url = route.request().url();
  //   const method = route.request().method();
  //   console.log('🔍 DEBUGGING: Provider API call detected:', {
  //     url,
  //     method,
  //     headers: route.request().headers(),
  //     isProviderUrl: url.includes('providers'),
  //   });
  //
  //   // Don't intercept, just log and continue to see actual patterns
  //   await route.continue();
  // });

  // FLEXIBLE PATTERNS - Remove strict query parameter requirements

  // Cluster-wide providers endpoint (flexible) - PRIORITY 1
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/providers(?:\?.*)?$/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED cluster-wide providers request (IMPROVED):', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
      console.log('✅ Responded to cluster-wide providers request');
    },
  );

  // Namespaced providers endpoint for openshift-mtv (most flexible) - PRIORITY 2
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/providers(?:\?.*)?$/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED openshift-mtv namespaced providers request (IMPROVED):', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
      console.log('✅ Responded to openshift-mtv namespaced providers request');
    },
  );

  // Namespaced providers endpoint (any namespace, flexible) - PRIORITY 3
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/[^/]+\/providers(?:\?.*)?$/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED namespaced providers request (IMPROVED):', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(providersResponse),
      });
      console.log('✅ Responded to namespaced providers request');
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

  // Provider List endpoint
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/providers.*$/,
    async (route) => {
      const url = route.request().url();
      console.log('🔧 INTERCEPTED Provider List:', url);
      console.log('🔧 Provider List Method:', route.request().method());

      if (route.request().method() === 'GET') {
        console.log('📦 Returning Provider List with', providersResponse.items.length, 'providers');
        console.log(
          '📦 Provider types:',
          providersResponse.items.map(
            (provider) => `${provider.metadata.name}(${provider.spec.type})`,
          ),
        );

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(providersResponse),
        });

        console.log('✅ Provider List response sent successfully');
      } else {
        await route.continue();
      }
    },
  );

  console.log('✨ Providers intercepts setup complete');

  // 🚨 CATCH-ALL DEBUGGER - Log any provider API calls that weren't intercepted above
  await page.route('**/api/kubernetes/**/*providers*', async (route) => {
    const url = route.request().url();
    console.log('❌ MISSED PROVIDER API CALL - URL pattern not matched:', {
      url,
      method: route.request().method(),
    });
    console.log('❌ This suggests the intercept patterns need to be updated');

    // Fallback: return our mock data anyway
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(providersResponse),
    });
    console.log('✅ Provided fallback mock response');
  });
};
