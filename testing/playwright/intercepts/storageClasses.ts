import type { Page } from '@playwright/test';

import { API_ENDPOINTS } from '../fixtures/test-data';

export const setupStorageClassesIntercepts = async (page: Page, targetProviderUid: string) => {
  const endpoint = API_ENDPOINTS.storageClasses(targetProviderUid);
  await page.route(endpoint, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          uid: 'test-storage-class-1-uid',
          version: '12345',
          namespace: '',
          name: 'test-ceph-rbd',
          selfLink: `providers/openshift/${targetProviderUid}/storageclasses/test-storage-class-1-uid`,
          id: 'test-storage-class-1-uid',
          object: {
            metadata: { name: 'test-ceph-rbd', uid: 'test-storage-class-1-uid' },
            provisioner: 'test.csi.ceph.com',
            reclaimPolicy: 'Delete',
            allowVolumeExpansion: true,
            volumeBindingMode: 'Immediate',
          },
        },
      ]),
    });
  });
};
