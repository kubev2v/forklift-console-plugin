import type { Page } from '@playwright/test';

import { API_ENDPOINTS } from '../fixtures/test-data';

export const setupStorageClassesIntercepts = async (page: Page, targetProviderUid: string) => {
  const endpoint = API_ENDPOINTS.storageClasses(targetProviderUid);
  await page.route(endpoint, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: 'test-storage-class-1-uid',
          name: 'test-ceph-rbd',
          namespace: '',
          object: {
            allowVolumeExpansion: true,
            metadata: { name: 'test-ceph-rbd', uid: 'test-storage-class-1-uid' },
            provisioner: 'test.csi.ceph.com',
            reclaimPolicy: 'Delete',
            volumeBindingMode: 'Immediate',
          },
          selfLink: `providers/openshift/${targetProviderUid}/storageclasses/test-storage-class-1-uid`,
          uid: 'test-storage-class-1-uid',
          version: '12345',
        },
        {
          id: 'test-storage-class-2-uid',
          name: 'test-cephfs',
          namespace: '',
          object: {
            allowVolumeExpansion: true,
            metadata: { name: 'test-cephfs', uid: 'test-storage-class-2-uid' },
            provisioner: 'test.csi.cephfs.com',
            reclaimPolicy: 'Delete',
            volumeBindingMode: 'Immediate',
          },
          selfLink: `providers/openshift/${targetProviderUid}/storageclasses/test-storage-class-2-uid`,
          uid: 'test-storage-class-2-uid',
          version: '12346',
        },
      ]),
      contentType: 'application/json',
      status: 200,
    });
  });
};
