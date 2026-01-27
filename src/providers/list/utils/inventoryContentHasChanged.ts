import type { MutableRefObject } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { hasObjectChangedInGivenFields } from 'src/providers/utils/helpers/hasObjectChangedInGivenFields';

import type { ProviderInventory, ProvidersInventoryList } from '@forklift-ui/types';

export const inventoryContentHasChanged = (
  newInventoryList: ProvidersInventoryList,
  oldDataRef: MutableRefObject<ProvidersInventoryList | null>,
  fieldsToAvoidComparing: string[],
): boolean => {
  const flatInventory = (inventoryList: ProvidersInventoryList | null) =>
    Object.values(PROVIDER_TYPES).flatMap<ProviderInventory>((type) => inventoryList?.[type] ?? []);

  const oldFlatInventory = flatInventory(oldDataRef.current);
  const newFlatInventory = flatInventory(newInventoryList);
  const oldInventoryMap = new Map(oldFlatInventory.map((item) => [item.uid, item]));
  const newInventoryMap = new Map(newFlatInventory.map((item) => [item.uid, item]));

  for (const [uid, oldItem] of oldInventoryMap) {
    const newItem = newInventoryMap.get(uid);
    if (
      !newItem ||
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing,
        newObject: newItem,
        oldObject: oldItem,
      })
    ) {
      return true;
    }
  }
  return false;
};
