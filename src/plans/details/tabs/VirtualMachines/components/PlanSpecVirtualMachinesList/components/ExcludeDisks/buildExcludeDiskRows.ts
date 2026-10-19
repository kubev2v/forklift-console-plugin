import {
  formatDiskSizeLabel,
  getDiskBusAddress,
  getDiskCapacityBytes,
  getDiskFileName,
  getDiskShared,
} from 'src/plans/utils/excludeDisks/diskBusAddress';

import { EMPTY_MSG } from '@utils/constants';
import { t } from '@utils/i18n';

import type { ExcludeDiskRowData } from './types';

const SHARED_FILTER_NO = 'no';
const SHARED_FILTER_UNKNOWN = 'unknown';
const SHARED_FILTER_YES = 'yes';

const toSharedFilterValue = (shared: boolean | undefined): string => {
  if (shared) {
    return SHARED_FILTER_YES;
  }

  if (shared === false) {
    return SHARED_FILTER_NO;
  }

  return SHARED_FILTER_UNKNOWN;
};

const diskToRow = (disk: unknown): ExcludeDiskRowData | undefined => {
  const busAddress = getDiskBusAddress(disk);
  if (!busAddress) {
    return undefined;
  }

  const sizeBytes = getDiskCapacityBytes(disk);
  const shared = getDiskShared(disk);
  const fileName = getDiskFileName(disk) ?? EMPTY_MSG;

  return {
    busAddress,
    fileName,
    id: busAddress,
    inInventory: true,
    shared,
    sharedFilterValue: toSharedFilterValue(shared),
    sizeBytes,
    sizeLabel: formatDiskSizeLabel(sizeBytes),
  };
};

export const buildExcludeDiskRows = ({
  disks,
  existingExcludeDisks = [],
}: {
  disks: unknown[] | undefined;
  existingExcludeDisks?: string[];
}): ExcludeDiskRowData[] => {
  const rowById = new Map<string, ExcludeDiskRowData>();

  for (const disk of disks ?? []) {
    const row = diskToRow(disk);
    if (row) {
      rowById.set(row.id, row);
    }
  }

  for (const address of existingExcludeDisks) {
    if (!rowById.has(address)) {
      rowById.set(address, {
        busAddress: address,
        fileName: t('Not in current inventory'),
        id: address,
        inInventory: false,
        shared: undefined,
        sharedFilterValue: SHARED_FILTER_UNKNOWN,
        sizeBytes: 0,
        sizeLabel: EMPTY_MSG,
      });
    }
  }

  return [...rowById.values()].sort((left, right) =>
    left.busAddress.localeCompare(right.busAddress),
  );
};

export const getSelectableBusAddressesFromRows = (rows: ExcludeDiskRowData[]): string[] =>
  rows.filter((row) => row.inInventory).map((row) => row.busAddress);
