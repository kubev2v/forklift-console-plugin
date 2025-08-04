import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupVirtualMachinesIntercepts = async (
  page: Page,
  sourceProviderType = 'vsphere',
) => {
  // Use API_ENDPOINTS function for consistency
  const endpoint = API_ENDPOINTS.virtualMachines(
    sourceProviderType,
    TEST_DATA.providers.source.uid,
  );

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

  await page.route(endpoint, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: responseBody,
    });
  });
};
