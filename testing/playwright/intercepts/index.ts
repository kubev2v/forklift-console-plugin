import type { Page } from '@playwright/test';

export { setupCoreKubernetesIntercepts } from './core';
export { setupDatastoresIntercepts } from './datastores';
export { setupHostsIntercepts } from './hosts';
export { setupNetworkMapsIntercepts } from './networkMaps';
export { setupPlanDetailsIntercepts } from './planDetails';
export { setupPlansIntercepts } from './plans';
export { setupProjectsIntercepts } from './projects';
export { setupProvidersIntercepts } from './providers';
export { setupStorageClassesIntercepts } from './storageClasses';
export { setupStorageMapsIntercepts } from './storageMaps';
export { setupTargetProviderNamespacesIntercepts } from './targetProviderNamespaces';
export { setupVirtualMachinesIntercepts } from './virtualMachines';

// Import individual functions for the comprehensive setup
import { setupCoreKubernetesIntercepts } from './core';
import { setupDatastoresIntercepts } from './datastores';
import { setupHostsIntercepts } from './hosts';
import { setupNetworkMapsIntercepts } from './networkMaps';
import { setupPlanDetailsIntercepts } from './planDetails';
import { setupPlansIntercepts } from './plans';
import { setupProjectsIntercepts } from './projects';
import { setupProvidersIntercepts } from './providers';
import { setupStorageClassesIntercepts } from './storageClasses';
import { setupStorageMapsIntercepts } from './storageMaps';
import { setupTargetProviderNamespacesIntercepts } from './targetProviderNamespaces';
import { setupVirtualMachinesIntercepts } from './virtualMachines';

// Comprehensive setup function for existing tests to work in GitHub Actions
export const setupForkliftIntercepts = async (page: Page): Promise<void> => {
  // Core Kubernetes API intercepts for console bootstrap
  await setupCoreKubernetesIntercepts(page);

  // Forklift-specific interceptors
  await setupProvidersIntercepts(page);
  await setupPlansIntercepts(page);
  await setupPlanDetailsIntercepts(page);
  await setupProjectsIntercepts(page);
  await setupNetworkMapsIntercepts(page);
  await setupStorageMapsIntercepts(page);
  await setupVirtualMachinesIntercepts(page, 'vsphere');
  await setupHostsIntercepts(page, 'vsphere');
  await setupDatastoresIntercepts(page, 'vsphere');
  await setupStorageClassesIntercepts(page, 'test-target-uid-1');
  await setupTargetProviderNamespacesIntercepts(page, 'test-target-uid-1');
};
