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
      cluster: vm.cluster,
      concerns: [],
      cpuCores: vm.cpuCores,
      cpuSockets: vm.cpuSockets,
      diskAttachments: [
        {
          bootable: true,
          disk: 'test-disk-1',
          id: 'test-disk-1',
          interface: 'virtio_scsi',
          scsiReservation: false,
        },
      ],
      guestName: `${vm.name} Guest`,
      host: vm.host,
      id: vm.id,
      isTemplate: false,
      memory: vm.memory,
      name: vm.name,
      nics: [
        {
          id: 'test-nic-1',
          interface: 'virtio',
          ipAddress: '',
          mac: '00:12:4a:16:37:2d',
          name: 'nic1',
          plugged: true,
        },
      ],
      osType: vm.osType,
      parent: {
        id: 'test-folder-1',
        kind: 'Folder',
      },
      path: `L0_Group_Test/${vm.name}`,
      policyVersion: 6,
      revision: 1,
      revisionValidated: 1,
      selfLink: `providers/test/${vm.id}`,
      status: vm.status,
    })),
  );

  await page.route(endpoint, async (route) => {
    await route.fulfill({
      body: responseBody,
      contentType: 'application/json',
      status: 200,
    });
  });
};
