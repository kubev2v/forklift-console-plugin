import { OVirtDisk, OVirtDiskAttachment } from '@kubev2v/types';

import {
  OVIRT_01_UID,
  OVIRT_02_UID,
  OVIRT_03_UID,
  OVIRT_INSECURE_UID,
  OvirtProviderIDs,
} from './providers.mock';

const disk1DaId = '10564686-1464-4baa-b65a-0dc2eb4645a8';
const disk2DaId = '2d948af7-11be-4817-a9b9-36d7330586b1';
const disk3DaId = '33f51a02-6d51-46e6-85d7-f4864a90ae10';
const disk4DaId = '45b22939-31f9-4ff7-a290-104b59cfcf75';
const disk5DaId = '52f84502-3bd1-4ac5-9107-fb7629cc2fdd';

export const MOCK_DISK_ATTACHMENTS: { [uid in OvirtProviderIDs]: OVirtDiskAttachment[] } = {
  [OVIRT_01_UID]: [
    {
      disk: disk1DaId,
      id: disk1DaId,
      interface: 'virtio_scsi',
      scsiReservation: false,
    },
  ],
  [OVIRT_02_UID]: [
    {
      disk: disk2DaId,
      id: disk2DaId,
      interface: 'virtio_scsi',
      scsiReservation: false,
    },
  ],
  [OVIRT_INSECURE_UID]: [
    {
      disk: disk3DaId,
      id: disk3DaId,
      interface: 'virtio_scsi',
      scsiReservation: false,
    },
  ],
  [OVIRT_03_UID]: [
    {
      disk: disk4DaId,
      id: disk4DaId,
      interface: 'virtio_scsi',
      scsiReservation: false,
    },
    {
      disk: disk5DaId,
      id: disk5DaId,
      interface: 'virtio_scsi',
      scsiReservation: false,
    },
  ],
};

export const MOCK_DISKS: { [uid in OvirtProviderIDs]: OVirtDisk[] } = {
  [OVIRT_01_UID]: [
    {
      id: disk1DaId,
      name: 'MOCK_DISK_STORE-1',
      description: 'Mock disk store no 1',
      shared: false,
      revision: 1,
      selfLink: `providers/ovirt/${OVIRT_01_UID}/disks/${disk1DaId}`,
      storageDomain: 'sd-uid-1',
      profile: 'profile-uid-1',
      provisionedSize: 134217728,
      actualSize: 134217728,
      storageType: 'image',
      status: 'ok',
    },
  ],
  [OVIRT_02_UID]: [
    {
      id: disk2DaId,
      name: 'MOCK_DISK_STORE-2',
      shared: false,
      revision: 1,
      selfLink: `providers/ovirt/${OVIRT_02_UID}/disks/${disk2DaId}`,
      storageDomain: 'sd-uid-2',
      profile: 'profile-uid-2',
      provisionedSize: 920064,
      actualSize: 0,
      storageType: 'image',
      status: 'ok',
    },
  ],
  [OVIRT_INSECURE_UID]: [
    {
      id: disk3DaId,
      name: 'MOCK_DISK_STORE-3',
      description: 'Mock disk store no 3',
      shared: false,
      revision: 1,
      selfLink: `providers/ovirt/${OVIRT_INSECURE_UID}/disks/${disk3DaId}`,
      storageDomain: 'sd-uid-3',
      profile: 'profile-uid-3',
      provisionedSize: 2501120,
      actualSize: 2501120,
      storageType: 'image',
      status: 'ok',
    },
  ],
  [OVIRT_03_UID]: [
    {
      id: disk4DaId,
      name: 'MOCK_DISK_STORE-4',
      description: 'Mock disk store no 4',
      shared: false,
      revision: 1,
      selfLink: `providers/ovirt/${OVIRT_03_UID}/disks/${disk4DaId}`,
      storageDomain: 'sd-uid-4',
      profile: 'profile-uid-4',
      provisionedSize: 2501120,
      actualSize: 2501120,
      storageType: 'image',
      status: 'locked',
    },
    {
      id: disk5DaId,
      name: 'MOCK_DISK_STORE-5',
      description: 'Mock disk store no 5',
      shared: false,
      revision: 1,
      selfLink: `providers/ovirt/${OVIRT_03_UID}/disks/${disk5DaId}`,
      storageDomain: 'sd-uid-5',
      profile: '',
      provisionedSize: 920064,
      actualSize: 0,
      storageType: 'image',
      status: 'ok',
    },
  ],
};
