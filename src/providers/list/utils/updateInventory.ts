import type { MutableRefObject, SetStateAction } from 'react';

import type { ProvidersInventoryList } from '@kubev2v/types';

export const updateInventory = (
  newInventoryList: ProvidersInventoryList,
  setInventory: (value: SetStateAction<ProvidersInventoryList | null>) => void,
  oldDataRef: MutableRefObject<ProvidersInventoryList | null>,
): void => {
  setInventory(newInventoryList);

  oldDataRef.current = newInventoryList;
};
