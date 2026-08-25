import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';

export const setupProvidersIntercepts = async (page: Page) => {
  const providersResponse = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    items: [
      {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Provider',
        metadata: {
          name: TEST_DATA.providers.source.name,
          namespace: MTV_NAMESPACE,
          uid: TEST_DATA.providers.source.uid,
        },
        spec: {
          type: TEST_DATA.providers.source.type,
          url: TEST_DATA.providers.source.url,
        },
        status: {
          conditions: [
            {
              message: 'The provider is ready.',
              status: 'True',
              type: 'Ready',
            },
          ],
          phase: 'Ready',
        },
      },
      {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Provider',
        metadata: {
          name: TEST_DATA.providers.target.name,
          namespace: MTV_NAMESPACE,
          uid: TEST_DATA.providers.target.uid,
        },
        spec: {
          type: TEST_DATA.providers.target.type,
          url: TEST_DATA.providers.target.url,
        },
        status: {
          conditions: [
            {
              message: 'The provider is ready.',
              status: 'True',
              type: 'Ready',
            },
          ],
          phase: 'Ready',
        },
      },
    ],
    kind: 'ProviderList',
    metadata: {
      continue: '',
      remainingItemCount: 0,
      resourceVersion: '12345',
    },
  };

  // Kubernetes API for providers (use API_ENDPOINTS)
  await page.route(API_ENDPOINTS.providers, async (route) => {
    await route.fulfill({
      body: JSON.stringify(providersResponse),
      contentType: 'application/json',
      status: 200,
    });
  });

  // Namespaced providers endpoint (handles ?limit=250)
  await page.route(API_ENDPOINTS.providers, async (route) => {
    await route.fulfill({
      body: JSON.stringify(providersResponse),
      contentType: 'application/json',
      status: 200,
    });
  });

  // Individual Provider fetch endpoints
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/[^/]+\/providers\/[^/?]+$/u,
    async (route) => {
      if (route.request().method() === 'GET') {
        const url = route.request().url();
        const providerName = url.split('/').pop();

        // Try to find matching provider from our mock data
        const provider = providersResponse.items.find(
          (prov) => prov.metadata.name === providerName,
        );

        await route.fulfill({
          body: JSON.stringify(provider ?? providersResponse.items[0]),
          contentType: 'application/json',
          status: 200,
        });
      }
    },
  );

  // Provider inventory connections - make sure each provider can be connected to
  await page.route('**/forklift-inventory/providers/*/test', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ connectionState: 'ok' }),
      contentType: 'application/json',
      status: 200,
    });
  });

  // Source provider networks (vsphere)
  await page.route(
    API_ENDPOINTS.networks('vsphere', TEST_DATA.providers.source.uid),
    async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            id: 'test-network-1-uid',
            name: 'test-vm-network',
            namespace: '',
            object: {
              name: 'test-vm-network',
              type: 'DistributedVirtualPortgroup',
              vlan: 100,
            },
            selfLink: 'providers/vsphere/test-source-uid-1/networks/test-network-1-uid',
            uid: 'test-network-1-uid',
            version: '12345',
          },
        ]),
        contentType: 'application/json',
        status: 200,
      });
    },
  );

  // Target provider network attachment definitions
  await page.route(
    `**/forklift-inventory/providers/openshift/${TEST_DATA.providers.target.uid}/networkattachmentdefinitions**`,
    async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            id: 'test-nad-1-uid',
            name: 'test-multus-bridge',
            namespace: 'test-target-namespace',
            object: {
              apiVersion: 'k8s.cni.cncf.io/v1',
              kind: 'NetworkAttachmentDefinition',
              metadata: {
                creationTimestamp: '2025-01-01T00:00:00Z',
                name: 'test-multus-bridge',
                namespace: 'test-target-namespace',
                resourceVersion: '12345',
                uid: 'test-nad-1-uid',
              },
              spec: {
                config:
                  '{"cniVersion":"0.3.1","name":"test-multus-bridge","type":"bridge","bridge":"br0"}',
              },
            },
            selfLink: `providers/openshift/${TEST_DATA.providers.target.uid}/networkattachmentdefinitions/test-nad-1-uid`,
            uid: 'test-nad-1-uid',
            version: '12345',
          },
        ]),
        contentType: 'application/json',
        status: 200,
      });
    },
  );

  // Fallback catch-all for any missed provider calls (essential for GitHub Actions)
  await page.route('**/api/kubernetes/**/*providers*', async (route) => {
    await route.fulfill({
      body: JSON.stringify(providersResponse),
      contentType: 'application/json',
      status: 200,
    });
  });
};
