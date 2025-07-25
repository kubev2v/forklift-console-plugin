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

    // Handle storage classes for target provider
    if (url.includes('/providers/openshift/test-target-uid-1/storageclasses?detail=1')) {
      // eslint-disable-next-line no-console
      console.log(`🎯 CATCH-ALL HANDLING STORAGE CLASSES!`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            uid: 'test-storage-class-1-uid',
            version: '12345',
            namespace: '',
            name: 'test-ceph-rbd',
            selfLink:
              'providers/openshift/test-target-uid-1/storageclasses/test-storage-class-1-uid',
            id: 'test-storage-class-1-uid',
            object: {
              metadata: {
                name: 'test-ceph-rbd',
                uid: 'test-storage-class-1-uid',
                resourceVersion: '12345',
                creationTimestamp: '2025-01-01T00:00:00Z',
                annotations: {
                  'storageclass.kubernetes.io/is-default-class': 'true',
                },
              },
              provisioner: 'test.csi.ceph.com',
              reclaimPolicy: 'Delete',
              allowVolumeExpansion: true,
              volumeBindingMode: 'Immediate',
            },
          },
        ]),
      });
      return;
    }

    // Handle networks for source provider (vsphere)
    if (url.includes('/providers/vsphere/test-source-uid-1/networks')) {
      // eslint-disable-next-line no-console
      console.log(`🎯 CATCH-ALL HANDLING SOURCE NETWORKS!`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            uid: 'test-network-1-uid',
            version: '12345',
            namespace: '',
            name: 'test-vm-network',
            selfLink: 'providers/vsphere/test-source-uid-1/networks/test-network-1-uid',
            id: 'test-network-1-uid',
            object: {
              name: 'test-vm-network',
              type: 'DistributedVirtualPortgroup',
              vlan: 100,
            },
          },
          {
            uid: 'test-network-2-uid',
            version: '12346',
            namespace: '',
            name: 'test-mgmt-network',
            selfLink: 'providers/vsphere/test-source-uid-1/networks/test-network-2-uid',
            id: 'test-network-2-uid',
            object: {
              name: 'test-mgmt-network',
              type: 'DistributedVirtualPortgroup',
              vlan: 200,
            },
          },
        ]),
      });
      return;
    }

    // Handle datastores for source provider (vsphere)
    if (url.includes('/providers/vsphere/test-source-uid-1/datastores')) {
      // eslint-disable-next-line no-console
      console.log(`🎯 CATCH-ALL HANDLING DATASTORES!`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test-datastore-1',
            parent: {
              kind: 'Folder',
              id: 'group-test-datastore',
            },
            path: '/test/datastore/test-datastore-1',
            revision: 212,
            name: 'test-datastore-1',
            selfLink: 'providers/vsphere/test-source-uid-1/datastores/test-datastore-1',
          },
          {
            id: 'test-datastore-2',
            parent: {
              kind: 'Folder',
              id: 'group-test-datastore',
            },
            path: '/test/datastore/test-datastore-2',
            revision: 1,
            name: 'test-datastore-2',
            selfLink: 'providers/vsphere/test-source-uid-1/datastores/test-datastore-2',
          },
        ]),
      });
      return;
    }

    // Handle network attachment definitions for target provider
    if (url.includes('/providers/openshift/test-target-uid-1/networkattachmentdefinitions')) {
      // eslint-disable-next-line no-console
      console.log(`🎯 CATCH-ALL HANDLING NETWORK ATTACHMENT DEFINITIONS!`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            uid: 'test-nad-1-uid',
            version: '12345',
            namespace: 'test-target-namespace',
            name: 'test-multus-bridge',
            selfLink:
              'providers/openshift/test-target-uid-1/networkattachmentdefinitions/test-nad-1-uid',
            id: 'test-nad-1-uid',
            object: {
              apiVersion: 'k8s.cni.cncf.io/v1',
              kind: 'NetworkAttachmentDefinition',
              metadata: {
                name: 'test-multus-bridge',
                namespace: 'test-target-namespace',
                uid: 'test-nad-1-uid',
                resourceVersion: '12345',
                creationTimestamp: '2025-01-01T00:00:00Z',
              },
              spec: {
                config:
                  '{"cniVersion":"0.3.1","name":"test-multus-bridge","type":"bridge","bridge":"br0","isDefaultGateway":true,"ipMasq":true,"hairpinMode":true,"ipam":{"type":"host-local","subnet":"192.168.1.0/24"}}',
              },
            },
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
