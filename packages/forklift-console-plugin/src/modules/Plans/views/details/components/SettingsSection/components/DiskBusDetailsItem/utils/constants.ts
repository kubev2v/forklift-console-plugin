import { DiskBusType } from '../../../utils/types';

export const diskBusTypeLabels = {
  [DiskBusType.VIRTIO]: 'VirtIO',
  [DiskBusType.SATA]: 'SATA',
  [DiskBusType.SCSI]: 'SCSI',
};

export const PRESERVE_DISK_BUS = 'preserve-disk-bus';
export const diskBusDropdownItems = [DiskBusType.VIRTIO, DiskBusType.SATA, DiskBusType.SCSI];
