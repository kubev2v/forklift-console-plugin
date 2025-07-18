import type { Page } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';

export const setupVirtualMachinesIntercepts = async (
  page: Page,
  sourceProviderType = 'vsphere',
) => {
  // Handle both single and double slash variations
  const endpoint1 = `**/forklift-inventory/providers/${sourceProviderType}/test-source-uid-1/vms?detail=4`;
  const endpoint2 = `**/forklift-inventory/providers/${sourceProviderType}/test-source-uid-1//vms?detail=4`;

  const responseBody = JSON.stringify(
    TEST_DATA.virtualMachines.map((vm) => ({
      id: vm.id,
      revision: 1,
      path: `L0_Group_Test/${vm.name}`,
      name: vm.name,
      selfLink: `providers/test/${vm.id}`,
      cluster: vm.cluster,
      status: vm.status,
      host: vm.host,
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
      guestName: `${vm.name} Guest`,
      cpuSockets: vm.cpuSockets,
      cpuCores: vm.cpuCores,
      memory: vm.memory,
      osType: vm.osType,
    })),
  );

  // Set up routes for both variations
  await page.route(endpoint1, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: responseBody,
    });
  });

  await page.route(endpoint2, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: responseBody,
    });
  });
};
