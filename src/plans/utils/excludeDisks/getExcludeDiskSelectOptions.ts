import type { TypeaheadSelectOption } from '@components/common/TypeaheadSelect/utils/types';
import { isEmpty } from '@utils/helpers';

import { getDiskBusAddress, getExcludeDiskOptionLabel } from './diskBusAddress';

export const getSelectableBusAddresses = (disks: unknown[] | undefined): string[] => {
  if (!disks) {
    return [];
  }

  const addresses: string[] = [];

  for (const disk of disks) {
    const busAddress = getDiskBusAddress(disk);
    if (busAddress) {
      addresses.push(busAddress);
    }
  }

  return addresses;
};

export const getExcludeDiskSelectOptions = ({
  disks,
  existingExcludeDisks = [],
}: {
  disks: unknown[] | undefined;
  existingExcludeDisks?: string[];
}): TypeaheadSelectOption[] => {
  const optionByValue = new Map<string, TypeaheadSelectOption>();

  for (const disk of disks ?? []) {
    const busAddress = getDiskBusAddress(disk);
    if (busAddress) {
      optionByValue.set(busAddress, {
        content: getExcludeDiskOptionLabel(disk, busAddress),
        value: busAddress,
      });
    }
  }

  for (const address of existingExcludeDisks) {
    if (!optionByValue.has(address)) {
      optionByValue.set(address, {
        content: address,
        value: address,
      });
    }
  }

  return [...optionByValue.values()].sort((left, right) =>
    String(left.value).localeCompare(String(right.value)),
  );
};

export const areExcludeDiskSelectionsEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort((a, b) => a.localeCompare(b));
  const sortedRight = [...right].sort((a, b) => a.localeCompare(b));

  return sortedLeft.every((value, index) => value === sortedRight[index]);
};

export const wouldExcludeAllDisks = (
  selected: string[],
  selectableAddresses: string[],
): boolean => {
  if (isEmpty(selectableAddresses)) {
    return false;
  }

  if (selected.length < selectableAddresses.length) {
    return false;
  }

  const selectedSet = new Set(selected);

  return selectableAddresses.every((address) => selectedSet.has(address));
};
