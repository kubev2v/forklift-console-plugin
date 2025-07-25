import type { Page } from '@playwright/test';

export { setupCatchAllInventoryIntercepts } from './catchAllInventory';
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
import { setupCatchAllInventoryIntercepts } from './catchAllInventory';
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

  // Handle networks with double slash (from URL patterns observed)
  await page.route(
    '**/forklift-inventory/providers/vsphere/test-source-uid-1//networks',
    async (route) => {
      // eslint-disable-next-line no-console
      console.log(`🎯 NETWORKS WITH DOUBLE SLASH: ${route.request().url()}`);
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
        ]),
      });
    },
  );

  // NetworkAttachmentDefinitions for OpenShift target provider (CRITICAL for plan details)
  await page.route(
    '**/forklift-inventory/providers/openshift/test-target-uid-1/networkattachmentdefinitions',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            uid: 'test-nad-1-uid',
            name: 'test-multus-network',
            namespace: 'default',
            selfLink:
              'providers/openshift/test-target-uid-1/networkattachmentdefinitions/test-nad-1-uid',
            object: {
              metadata: {
                name: 'test-multus-network',
                namespace: 'default',
                uid: 'test-nad-1-uid',
              },
              spec: {
                config: '{"cniVersion":"0.3.1","type":"macvlan","master":"eth0","mode":"bridge"}',
              },
            },
          },
        ]),
      });
    },
  );

  // Broad proxy interceptor to catch all plugin proxy calls
  await page.route('**/api/proxy/plugin/**', async (route) => {
    const url = route.request().url();
    // eslint-disable-next-line no-console
    console.log(`🌐 ALL PROXY CALLS: ${url}`);

    // Handle target provider namespaces specifically
    if (url.includes('/providers/openshift/test-target-uid-1/namespaces')) {
      // eslint-disable-next-line no-console
      console.log(`🎯 INTERCEPTED TARGET NAMESPACES!`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            uid: 'test-target-project-uid',
            name: 'test-target-project',
            selfLink: 'providers/openshift/test-target-uid-1/namespaces/test-target-project',
          },
          {
            uid: 'default-uid',
            name: 'default',
            selfLink: 'providers/openshift/test-target-uid-1/namespaces/default',
          },
          {
            uid: 'openshift-mtv-uid',
            name: 'openshift-mtv',
            selfLink: 'providers/openshift/test-target-uid-1/namespaces/openshift-mtv',
          },
        ]),
      });
      return;
    }

    // Let other calls through
    await route.continue();
  });

  // Target provider networks (OpenShift networks)
  await page.route(
    '**/forklift-inventory/providers/openshift/test-target-uid-1/networks',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            uid: 'test-openshift-network-1-uid',
            name: 'default',
            namespace: 'default',
            selfLink: 'providers/openshift/test-target-uid-1/networks/test-openshift-network-1-uid',
            object: {
              metadata: {
                name: 'default',
                namespace: 'default',
                uid: 'test-openshift-network-1-uid',
              },
              spec: {
                type: 'OpenShiftSDN',
              },
            },
          },
        ]),
      });
    },
  );

  // Use the catch-all inventory interceptors
  await setupCatchAllInventoryIntercepts(page);

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
