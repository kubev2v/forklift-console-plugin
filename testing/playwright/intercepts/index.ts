import type { Page } from '@playwright/test';

// Export individual intercept functions
export { setupDatastoresIntercepts } from './datastores';
export { setupFoldersIntercepts } from './folders';
export { setupHostsIntercepts } from './hosts';
export { setupNetworkMapsIntercepts } from './networkMaps';
export { setupPlansIntercepts } from './plans';
export { setupProjectsIntercepts } from './projects';
export { setupProvidersIntercepts } from './providers';
export { setupStorageClassesIntercepts } from './storageClasses';
export { setupStorageMapsIntercepts } from './storageMaps';
export { setupTargetProviderNamespacesIntercepts } from './targetProviderNamespaces';
export { setupVirtualMachinesIntercepts } from './virtualMachines';

// Import individual functions for convenience functions
import { setupDatastoresIntercepts } from './datastores';
import { setupFoldersIntercepts } from './folders';
import { setupHostsIntercepts } from './hosts';
import { setupNetworkMapsIntercepts } from './networkMaps';
import { setupPlansIntercepts } from './plans';
import { setupProjectsIntercepts } from './projects';
import { setupProvidersIntercepts } from './providers';
import { setupStorageClassesIntercepts } from './storageClasses';
import { setupStorageMapsIntercepts } from './storageMaps';
import { setupTargetProviderNamespacesIntercepts } from './targetProviderNamespaces';
import { setupVirtualMachinesIntercepts } from './virtualMachines';

// Convenience function to setup all basic intercepts (like Cypress beforeEach)
export const setupAllBasicIntercepts = async (page: Page) => {
  await setupProjectsIntercepts(page);
  await setupPlansIntercepts(page);
  await setupProvidersIntercepts(page);
  await setupNetworkMapsIntercepts(page);
  await setupStorageMapsIntercepts(page);
};

// Setup all intercepts needed for plan creation wizard
export const setupCreatePlanIntercepts = async (page: Page, sourceProviderType = 'vsphere') => {
  await setupAllBasicIntercepts(page);
  await setupVirtualMachinesIntercepts(page, sourceProviderType);
  await setupTargetProviderNamespacesIntercepts(page);
  await setupHostsIntercepts(page, sourceProviderType);
  await setupFoldersIntercepts(page, sourceProviderType);
  await setupDatastoresIntercepts(page, sourceProviderType);
  await setupStorageClassesIntercepts(page);
};
