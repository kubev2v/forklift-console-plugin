import { EMPTY_MSG } from '@utils/constants';
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
  Shared?: boolean;
  shared?: boolean;
};

const GIB_BYTES = 1024 ** 3;

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

const normalizeBusAddress = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || isEmpty(value)) {
    return undefined;
  }

  return value;
};

export const getDiskBusAddress = (disk: unknown): string | undefined => {
  if (typeof disk !== 'object' || disk === null) {
    return undefined;
  }

  const diskRecord = disk as InventoryDiskLike;

  return normalizeBusAddress(diskRecord.busAddress) ?? normalizeBusAddress(diskRecord.BusAddress);
};

export const getDiskFileName = (disk: unknown): string | undefined => {
  if (typeof disk !== 'object' || disk === null) {
    return undefined;
  }

  return getDiskFileLabel(disk);
};

export const getDiskCapacityBytes = (disk: unknown): number => {
  if (typeof disk !== 'object' || disk === null) {
    return 0;
  }

  const diskRecord = disk as InventoryDiskLike;
  const capacity = diskRecord.capacity ?? diskRecord.Capacity;

  return capacity !== undefined && capacity > 0 ? capacity : 0;
};

export const getDiskShared = (disk: unknown): boolean | undefined => {
  if (typeof disk !== 'object' || disk === null) {
    return undefined;
  }

  const diskRecord = disk as InventoryDiskLike;
  const shared = diskRecord.shared ?? diskRecord.Shared;

  return typeof shared === 'boolean' ? shared : undefined;
};

export const formatDiskSizeLabel = (capacityBytes: number): string => {
  const label = formatDiskCapacityGiB(capacityBytes);

  return label ?? EMPTY_MSG;
};
