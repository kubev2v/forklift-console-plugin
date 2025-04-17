import type { ProviderInventory, ProvidersInventoryList } from '@kubev2v/types';

import { hasObjectChangedInGivenFields } from '../../../modules/Providers/utils/helpers/hasObjectChangedInGivenFields';

import { PROVIDER_TYPES } from './constants';

export const updateInventoryIfChanged = (
  newInventoryList: ProvidersInventoryList,
  setInventory: (value: React.SetStateAction<ProvidersInventoryList | null>) => void,
  oldDataRef: React.MutableRefObject<ProvidersInventoryList | null>,
  setLoading: (value: React.SetStateAction<boolean>) => void,
  fieldsToAvoidComparing: string[],
  // eslint-disable-next-line @typescript-eslint/max-params
): void => {
  const oldTotalLength = Object.values(PROVIDER_TYPES).reduce(
    (total, type) => total + (oldDataRef.current?.[type]?.length ?? 0),
    0,
  );
  const newTotalLength = Object.values(PROVIDER_TYPES).reduce(
    (total, type) => total + (newInventoryList[type]?.length ?? 0),
    0,
  );

  const hasInventorySizeChanged = oldTotalLength !== newTotalLength;
  let needReRender = hasInventorySizeChanged;

  if (!hasInventorySizeChanged && oldTotalLength !== 0) {
    const oldFlatInventory = Object.values(PROVIDER_TYPES).flatMap<ProviderInventory>(
      (type) => oldDataRef.current?.[type] ?? [],
    );
    const newFlatInventory = Object.values(PROVIDER_TYPES).flatMap<ProviderInventory>(
      (type) => newInventoryList[type] ?? [],
    );
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
        needReRender = true;
        break;
      }
    }
  }

  if (needReRender) {
    setInventory(newInventoryList);
    setLoading(false);
    oldDataRef.current = newInventoryList;
  }
};
