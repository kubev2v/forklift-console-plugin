import {
  areExcludeDiskSelectionsEqual,
  wouldExcludeAllDisks,
} from 'src/plans/utils/excludeDisks/excludeDiskSelection';

import { isEmpty } from '@utils/helpers';

type ExcludeDiskSelectionValidation = {
  current: string[];
  diskLoadError: Error | null;
  isInventoryLoading: boolean;
  selectableAddresses: string[];
  selected: string[];
};

export const hasInvalidExcludeDiskSelection = ({
  current,
  diskLoadError,
  isInventoryLoading,
  selectableAddresses,
  selected,
}: ExcludeDiskSelectionValidation): boolean => {
  if (wouldExcludeAllDisks(selected, selectableAddresses)) {
    return true;
  }

  if (areExcludeDiskSelectionsEqual(selected, current)) {
    return false;
  }

  return isInventoryLoading || diskLoadError !== null || isEmpty(selectableAddresses);
};
