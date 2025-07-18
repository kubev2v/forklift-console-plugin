import type { Page } from '@playwright/test';

export const setupStorageClassesIntercepts = async (
  page: Page,
  targetProviderId = 'test-target-uid-1',
) => {
  const endpoint = `**/forklift-inventory/providers/openshift/${targetProviderId}/storageclasses?detail=1`;
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
          selfLink: `providers/openshift/${targetProviderId}/storageclasses/test-storage-class-1-uid`,
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
