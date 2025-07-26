import type { Page } from '@playwright/test';

export { setupDatastoresIntercepts } from './datastores';
export { setupHostsIntercepts } from './hosts';
export { setupNetworkMapsIntercepts } from './networkMaps';
export { setupPlansIntercepts } from './plans';
export { setupProjectsIntercepts } from './projects';
export { setupProvidersIntercepts } from './providers';
export { setupStorageClassesIntercepts } from './storageClasses';
export { setupStorageMapsIntercepts } from './storageMaps';
export { setupTargetProviderNamespacesIntercepts } from './targetProviderNamespaces';
export { setupVirtualMachinesIntercepts } from './virtualMachines';

// Import individual functions for the comprehensive setup
import { setupDatastoresIntercepts } from './datastores';
import { setupHostsIntercepts } from './hosts';
import { setupNetworkMapsIntercepts } from './networkMaps';
import { setupPlansIntercepts } from './plans';
import { setupProjectsIntercepts } from './projects';
import { setupProvidersIntercepts } from './providers';
import { setupStorageClassesIntercepts } from './storageClasses';
import { setupStorageMapsIntercepts } from './storageMaps';
import { setupTargetProviderNamespacesIntercepts } from './targetProviderNamespaces';
import { setupVirtualMachinesIntercepts } from './virtualMachines';

// Comprehensive setup function for existing tests to work in GitHub Actions
export const setupCreatePlanIntercepts = async (page: Page): Promise<void> => {
  // === CRITICAL: Core Kubernetes API intercepts for console bootstrap ===

  // OpenAPI v2 endpoint (required for console to discover API structure)
  await page.route('**/api/kubernetes/openapi/v2', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        swagger: '2.0',
        info: { title: 'Kubernetes', version: 'v1.0.0' },
        paths: {},
        definitions: {},
      }),
    });
  });

  // CustomResourceDefinitions endpoint (required for console to discover CRDs)
  await page.route(
    '**/api/kubernetes/apis/apiextensions.k8s.io/v1/customresourcedefinitions**',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          apiVersion: 'apiextensions.k8s.io/v1',
          kind: 'CustomResourceDefinitionList',
          metadata: {},
          items: [],
        }),
      });
    },
  );

  // User info endpoint
  await page.route('**/api/kubernetes/apis/user.openshift.io/v1/users/~', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'user.openshift.io/v1',
        kind: 'User',
        metadata: {
          name: 'test-user',
          uid: 'test-user-uid',
        },
      }),
    });
  });

  // Package manifest endpoint (for operators)
  await page.route('**/api/check-package-manifest/**', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Not found' }),
    });
  });

  // GraphQL endpoint (for console queries)
  await page.route('**/api/graphql', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null }),
    });
  });

  // WebSocket upgrade requests
  await page.route('**/api/graphql', async (route) => {
    if (route.request().headers().upgrade === 'websocket') {
      await route.abort();
    } else {
      await route.continue();
    }
  });

  // Authorization endpoints (essential for UI permissions)
  await page.route('**/apis/authorization.k8s.io/v1/subjectaccessreviews', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SubjectAccessReview',
        status: { allowed: true },
      }),
    });
  });

  // Use the original specific interceptors approach
  await setupProvidersIntercepts(page);
  await setupPlansIntercepts(page);
  await setupProjectsIntercepts(page);
  await setupNetworkMapsIntercepts(page);
  await setupStorageMapsIntercepts(page);
  await setupVirtualMachinesIntercepts(page, 'vsphere');
  await setupHostsIntercepts(page, 'vsphere');
  await setupDatastoresIntercepts(page, 'vsphere');
  await setupStorageClassesIntercepts(page, 'test-target-uid-1');
  await setupTargetProviderNamespacesIntercepts(page, 'test-target-uid-1');

  // Add missing source provider networks (vsphere)
  await page.route(
    '**/forklift-inventory/providers/vsphere/test-source-uid-1/networks',
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

  // Add missing target provider network attachment definitions
  await page.route(
    '**/forklift-inventory/providers/openshift/test-target-uid-1/networkattachmentdefinitions',
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
            selfLink:
              'providers/openshift/test-target-uid-1/networkattachmentdefinitions/test-nad-1-uid',
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
