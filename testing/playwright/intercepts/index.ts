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
  // eslint-disable-next-line no-console
  console.log('🔧 Setting up API intercepts...');

  // === CRITICAL: Core Kubernetes API intercepts for console bootstrap ===

  // OpenAPI v2 endpoint (required for console to discover API structure)
  await page.route('**/api/kubernetes/openapi/v2', async (route) => {
    // eslint-disable-next-line no-console
    console.log('🎯 INTERCEPTED OpenAPI v2 request');
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
      // eslint-disable-next-line no-console
      console.log('🎯 INTERCEPTED CRDs request');
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
    // eslint-disable-next-line no-console
    console.log('🎯 INTERCEPTED User info request');
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
    // eslint-disable-next-line no-console
    console.log('🎯 INTERCEPTED Package manifest request');
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Not found' }),
    });
  });

  // GraphQL endpoint (for console queries)
  await page.route('**/api/graphql', async (route) => {
    // eslint-disable-next-line no-console
    console.log('🎯 INTERCEPTED GraphQL request');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null }),
    });
  });

  // WebSocket upgrade requests
  await page.route('**/api/graphql', async (route) => {
    if (route.request().headers().upgrade === 'websocket') {
      // eslint-disable-next-line no-console
      console.log('🎯 BLOCKED WebSocket upgrade to GraphQL');
      await route.abort();
    } else {
      await route.continue();
    }
  });

  // Core Forklift resources
  await setupProvidersIntercepts(page);
  await setupPlansIntercepts(page);
  await setupProjectsIntercepts(page);
  await setupNetworkMapsIntercepts(page);
  await setupStorageMapsIntercepts(page);

  // Provider inventory data (needed for wizard steps)
  await setupVirtualMachinesIntercepts(page, 'vsphere');
  await setupHostsIntercepts(page, 'vsphere');
  await setupDatastoresIntercepts(page, 'vsphere');
  await setupStorageClassesIntercepts(page, 'test-target-uid-1');
  await setupTargetProviderNamespacesIntercepts(page, 'test-target-uid-1');

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

  // Network data for source provider
  await page.route(
    '**/forklift-inventory/providers/vsphere/test-source-uid-1/networks',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            uid: 'test-network-1-uid',
            name: 'test-vm-network',
            type: 'DistributedVirtualPortgroup',
            vlan: 100,
            selfLink: 'providers/vsphere/test-source-uid-1/networks/test-network-1-uid',
          },
          {
            uid: 'test-network-2-uid',
            name: 'test-mgmt-network',
            type: 'DistributedVirtualPortgroup',
            vlan: 200,
            selfLink: 'providers/vsphere/test-source-uid-1/networks/test-network-2-uid',
          },
        ]),
      });
    },
  );

  // Folders data for wizard
  await page.route(
    '**/forklift-inventory/providers/vsphere/test-source-uid-1/folders?detail=4',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test-folder-1',
            name: 'Test Folder 1',
            datacenter: 'test-datacenter-1',
            children: 0,
            selfLink: 'providers/vsphere/test-source-uid-1/folders/test-folder-1',
          },
          {
            id: 'test-folder-2',
            name: 'Test Folder 2',
            datacenter: 'test-datacenter-1',
            children: 0,
            selfLink: 'providers/vsphere/test-source-uid-1/folders/test-folder-2',
          },
        ]),
      });
    },
  );
};
