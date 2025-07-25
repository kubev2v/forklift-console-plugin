import type { Page } from '@playwright/test';

export const setupCatchAllInventoryIntercepts = async (page: Page): Promise<void> => {
  // Catch-all for any other forklift-inventory endpoints (prevents 404s)
  await page.route('**/forklift-inventory/**', async (route) => {
    const url = route.request().url();
    // eslint-disable-next-line no-console
    console.log(`🔍 UNHANDLED INVENTORY: ${url}`);

    // Handle target provider namespaces specifically
    if (url.includes('/providers/openshift/test-target-uid-1/namespaces')) {
      // eslint-disable-next-line no-console
      console.log(`🎯 CATCH-ALL HANDLING TARGET NAMESPACES!`);
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

    // Handle virtual machines
    if (url.includes('/providers/vsphere/test-source-uid-1/vms?detail=4')) {
      // eslint-disable-next-line no-console
      console.log(`🎯 CATCH-ALL HANDLING VIRTUAL MACHINES!`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test-vm-1',
            revision: 1,
            path: 'L0_Group_Test/test-virtual-machine-1',
            name: 'test-virtual-machine-1',
            selfLink: 'providers/vsphere/test-source-uid-1/vms/test-vm-1',
            cluster: 'test-cluster-1',
            status: 'down',
            host: 'test-host-1',
            parent: {
              kind: 'Folder',
              id: 'test-folder-1',
            },
            isTemplate: false,
            revisionValidated: 1,
            nics: [
              {
                id: 'test-nic-1',
                name: 'nic1',
                interface: 'virtio',
                plugged: true,
                ipAddress: '',
                mac: '00:12:4a:16:37:2d',
              },
            ],
            diskAttachments: [
              {
                id: 'test-disk-1',
                interface: 'virtio_scsi',
                scsiReservation: false,
                disk: 'test-disk-1',
                bootable: true,
              },
            ],
            concerns: [],
            policyVersion: 6,
            guestName: 'test-virtual-machine-1 Guest',
            cpuSockets: 2,
            cpuCores: 2,
            coresPerSocket: 1,
            memoryHotAddEnabled: false,
            cpuHotAddEnabled: false,
            firmwareType: 'bios',
            powerState: 'poweredOff',
            snapshots: [],
            changeTrackingEnabled: false,
            numaNodeAffinity: [],
            cpuAffinity: [],
            memory: 4294967296,
            balloonedMemory: 0,
            ipAddress: '',
            storageUsed: 42949672960,
            uuid: 'test-vm-1-uuid',
          },
        ]),
      });
      return;
    }

    // Handle hosts
    if (url.includes('/providers/vsphere/test-source-uid-1/hosts?detail=4')) {
      // eslint-disable-next-line no-console
      console.log(`🎯 CATCH-ALL HANDLING HOSTS!`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test-host-1',
            name: 'test-host-1.example.com',
            cluster: 'test-cluster-1',
            status: 'green',
            selfLink: 'providers/vsphere/test-source-uid-1/hosts/test-host-1',
          },
        ]),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
};
