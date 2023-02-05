import { IDisk } from 'legacy/src/queries';
import { IRHVDiskAttachment } from 'legacy/src/queries/types';

const disk1DaId = '10564686-1464-4baa-b65a-0dc2eb4645a8';
const disk2DaId = '2d948af7-11be-4817-a9b9-36d7330586b1';
const disk3DaId = '33f51a02-6d51-46e6-85d7-f4864a90ae10';
const disk4DaId = '45b22939-31f9-4ff7-a290-104b59cfcf75';
const disk5DaId = '52f84502-3bd1-4ac5-9107-fb7629cc2fdd';

export const MOCK_DISK_ATTACHMENTS: IRHVDiskAttachment[] = [
  {
    disk: disk1DaId,
    id: disk1DaId,
  },
  {
    disk: disk2DaId,
    id: disk2DaId,
  },
  {
    disk: disk3DaId,
    id: disk3DaId,
  },
  {
    disk: disk4DaId,
    id: disk4DaId,
  },
  {
    disk: disk5DaId,
    id: disk5DaId,
  },
];

export const MOCK_DISKS: IDisk[] = [
  {
    id: disk1DaId,
    name: 'MOCK_DISK_STORE-1',
    revision: 1,
    selfLink: `providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/disks/${disk1DaId}`,
    storageDomain: '1',
  },
  {
    id: disk2DaId,
    name: 'MOCK_DISK_STORE-2',
    revision: 1,
    selfLink: `providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/disks/${disk2DaId}`,
    storageDomain: '2',
  },
  {
    id: disk3DaId,
    name: 'MOCK_DISK_STORE-3',
    revision: 1,
    selfLink: `providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/disks/${disk3DaId}`,
    storageDomain: '3',
  },
  {
    id: disk4DaId,
    name: 'MOCK_DISK_STORE-4',
    revision: 1,
    selfLink: `providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/disks/${disk4DaId}`,
    storageDomain: '4',
  },
  {
    id: disk5DaId,
    name: 'MOCK_DISK_STORE-5',
    revision: 1,
    selfLink: `providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/disks/${disk5DaId}`,
    storageDomain: '5',
  },
];
