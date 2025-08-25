import { V1beta1ProviderList } from '@kubev2v/types';
import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupProvidersIntercepts = async (page: Page) => {
  const providersResponse: V1beta1ProviderList = {
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

  // Single, comprehensive handler for all provider-related API endpoints
  await page.route('**/api/kubernetes/**/*providers*', async (route) => {
    const url = route.request().url();

    // Handle GET requests for individual providers
    if (route.request().method() === 'GET' && !url.includes('?')) {
      const providerName = url.split('/').pop();
      const provider = ((providersResponse as any).items ?? []).find(
        (prov: any) => prov.metadata.name === providerName,
      );

      if (provider) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(provider),
        });
      }
    }

    // Default handler for list of providers (and fallback)
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(providersResponse),
    });
  });

  // Provider inventory connections - make sure each provider can be connected to
  await page.route('**/forklift-inventory/providers/*/test', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ connectionState: 'ok' }),
    });
  });

  // Source provider networks (vsphere)
  await page.route(
    API_ENDPOINTS.networks('vsphere', TEST_DATA.providers.source.uid),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            uid: 'test-network-1-uid',
            version: '12345',
            namespace: '',
            name: 'test-vm-network',
            selfLink: 'providers/vsphere/test-source-uid-1/networks/test-network-1-uid',
            id: 'test-network-1-uid',
            object: {
              name: 'test-vm-network',
              type: 'DistributedVirtualPortgroup',
              vlan: 100,
            },
          },
        ]),
      });
    },
  );

  // Target provider network attachment definitions
  await page.route(
    `**/forklift-inventory/providers/openshift/${TEST_DATA.providers.target.uid}/networkattachmentdefinitions`,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            uid: 'test-nad-1-uid',
            version: '12345',
            namespace: 'test-target-namespace',
            name: 'test-multus-bridge',
            selfLink: `providers/openshift/${TEST_DATA.providers.target.uid}/networkattachmentdefinitions/test-nad-1-uid`,
            id: 'test-nad-1-uid',
            object: {
              apiVersion: 'k8s.cni.cncf.io/v1',
              kind: 'NetworkAttachmentDefinition',
              metadata: {
                name: 'test-multus-bridge',
                namespace: 'test-target-namespace',
                uid: 'test-nad-1-uid',
                resourceVersion: '12345',
                creationTimestamp: '2025-01-01T00:00:00Z',
              },
              spec: {
                config:
                  '{"cniVersion":"0.3.1","name":"test-multus-bridge","type":"bridge","bridge":"br0"}',
              },
            },
          },
        ]),
      });
    },
  );
};
