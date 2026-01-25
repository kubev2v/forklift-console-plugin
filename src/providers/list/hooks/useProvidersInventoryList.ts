import { useEffect, useRef, useState } from 'react';
import { getInventoryApiUrl } from 'src/providers/utils/helpers/getApiUrl';

import type { ProvidersInventoryList } from '@forklift-ui/types';
import { consoleFetchJSON, useFlag } from '@openshift-console/dynamic-plugin-sdk';

import { DEFAULT_FIELDS_TO_AVOID_COMPARING } from '../utils/constants';
import { getProvidersInventoryByNamespace } from '../utils/getProvidersInventoryByNamespace';
import { inventoryHasChanged } from '../utils/inventoryHasChanged';
import { updateInventory } from '../utils/updateInventory';

type useProvidersInventoryListResult = {
  inventory: ProvidersInventoryList | null;
  loading: boolean;
  error: Error | null;
};

const useProvidersInventoryList = (
  namespace?: string,
  interval = 20000,
): useProvidersInventoryListResult => {
  const [inventory, setInventory] = useState<ProvidersInventoryList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const oldDataRef = useRef<ProvidersInventoryList | null>(null);
  const canList: boolean = useFlag('CAN_LIST_NS');

  /**
   * Handles any errors thrown when trying to fetch the inventory.
   * If the error is new (compared to the last error),
   * it sets the error state and stops the loading state.
   *
   * @param {Error} e The error object to handle
   * @returns {void}
   */
  const handleError = (e: Error | null): void => {
    setError(e);
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newInventory: ProvidersInventoryList = canList
          ? await consoleFetchJSON(getInventoryApiUrl(`providers?detail=1`))
          : await getProvidersInventoryByNamespace(namespace);

        if (inventoryHasChanged(newInventory, oldDataRef, DEFAULT_FIELDS_TO_AVOID_COMPARING))
          updateInventory(newInventory, setInventory, oldDataRef);
        setLoading(false);
      } catch (e) {
        handleError(e as Error);
      }
    };

    fetchData().catch((e) => {
      handleError(e as Error);
    });

    const intervalId = setInterval(fetchData, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, [canList, interval, namespace]);

  return { error, inventory, loading };
};

export default useProvidersInventoryList;
