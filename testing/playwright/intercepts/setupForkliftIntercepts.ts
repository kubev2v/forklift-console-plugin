import type { Page } from '@playwright/test';

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

/** Default upstream mock set (vSphere-oriented test UIDs). */
export const setupForkliftIntercepts = async (page: Page): Promise<void> => {
  await setupCoreKubernetesIntercepts(page);
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
