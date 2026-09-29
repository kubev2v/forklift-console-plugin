import { isEmpty } from '@utils/helpers';

type InventoryDiskLike = {
  BusAddress?: string;
  busAddress?: string;
  Capacity?: number;
  capacity?: number;
  File?: string;
  file?: string;
  Name?: string;
  name?: string;
};

const GIB_BYTES = 1024 ** 3;

export const getDiskBusAddress = (disk: unknown): string | undefined => {
  if (typeof disk !== 'object' || disk === null) {
    return undefined;
  }

  const diskRecord = disk as InventoryDiskLike;
  const address = diskRecord.busAddress ?? diskRecord.BusAddress;

  if (isEmpty(address)) {
    return undefined;
  }

  return address;
};

const getDiskFileLabel = (disk: InventoryDiskLike): string | undefined => {
  const file = disk.file ?? disk.File ?? disk.name ?? disk.Name;
  if (isEmpty(file)) {
    return undefined;
  }

  return file;
};

const formatDiskCapacityGiB = (capacity: number | undefined): string | undefined => {
  if (capacity === undefined || capacity <= 0) {
    return undefined;
  }

  const gib = Math.round(capacity / GIB_BYTES);
  return gib > 0 ? `${gib} GiB` : undefined;
};

export const getExcludeDiskOptionLabel = (disk: unknown, busAddress: string): string => {
  if (typeof disk !== 'object' || disk === null) {
    return busAddress;
  }

  const diskRecord = disk as InventoryDiskLike;
  const fileLabel = getDiskFileLabel(diskRecord);
  const capacityLabel = formatDiskCapacityGiB(diskRecord.capacity ?? diskRecord.Capacity);

  const details = [fileLabel, capacityLabel].filter(Boolean).join(' ');

  if (isEmpty(details)) {
    return busAddress;
  }

  return `${busAddress} — ${details}`;
};
