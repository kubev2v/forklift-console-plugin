import { isEmpty } from '@utils/helpers';

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
