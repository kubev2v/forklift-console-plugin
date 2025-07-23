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
