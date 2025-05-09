import type { MutableRefObject } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { ProvidersInventoryList } from '@kubev2v/types';

import { inventoryContentHasChanged } from './inventoryContentHasChanged';

export const inventoryHasChanged = (
  newInventoryList: ProvidersInventoryList,
  oldDataRef: MutableRefObject<ProvidersInventoryList | null>,
  fieldsToAvoidComparing: string[],
): boolean => {
  const totalNumOfProviders = (inventoryList: ProvidersInventoryList | null): number =>
    Object.values(PROVIDER_TYPES).reduce(
      (total, type) => total + (inventoryList ? (inventoryList[type]?.length ?? 0) : 0),
      0,
    );

  const oldTotalLength = totalNumOfProviders(oldDataRef.current);
  const newTotalLength = totalNumOfProviders(newInventoryList);

  const hasInventorySizeChanged = oldTotalLength !== newTotalLength;
  if (hasInventorySizeChanged) return true;

  if (!hasInventorySizeChanged && oldTotalLength !== 0) {
    return inventoryContentHasChanged(newInventoryList, oldDataRef, fieldsToAvoidComparing);
  }
  return false;
};
