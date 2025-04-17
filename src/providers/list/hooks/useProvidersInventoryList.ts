import { useEffect, useRef, useState } from 'react';

import type { ProvidersInventoryList, V1beta1Provider } from '@kubev2v/types';
import { consoleFetchJSON, useFlag } from '@openshift-console/dynamic-plugin-sdk';

import { getInventoryApiUrl } from '../../../modules/Providers/utils/helpers/getApiUrl';
import { DEFAULT_FIELDS_TO_AVOID_COMPARING } from '../utils/constants';
import { k8sGetProvidersByNamespace } from '../utils/k8sGetProvidersByNamespace';
import { updateInventoryIfChanged } from '../utils/updateInventoryIfChanged';

type UseInventoryParams = {
  namespace?: string;
  interval?: number; // Polling interval in milliseconds
};

type UseInventoryResult = {
  inventory: ProvidersInventoryList | null;
  loading: boolean;
  error: Error | null;
};

const useProvidersInventoryList = ({
  interval = 20000,
  namespace = undefined,
}: UseInventoryParams): UseInventoryResult => {
  const [inventory, setInventory] = useState<ProvidersInventoryList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const oldDataRef = useRef<ProvidersInventoryList | null>(null);
  const oldErrorRef = useRef<string | null>(null);
  const canList: boolean = useFlag('CAN_LIST_NS');

  const getInventoryByNamespace = async (
    currNamespace: string | undefined,
  ): Promise<ProvidersInventoryList | null> => {
    const newInventory: ProvidersInventoryList = {
      openshift: [],
      openstack: [],
      ova: [],
      ovirt: [],
      vsphere: [],
    };

    const providers = await k8sGetProvidersByNamespace(currNamespace);

    const readyProviders = providers?.filter(
      (provider: V1beta1Provider) => provider?.status?.phase === 'Ready',
    );

    const inventoryProviderURL = (provider: V1beta1Provider) =>
      `providers/${provider?.spec?.type}/${provider?.metadata?.uid}`;

    const allPromises = Promise.all(
      readyProviders.map(async (provider) => {
        return consoleFetchJSON(
          getInventoryApiUrl(inventoryProviderURL(provider)),
        ) as Promise<ProvidersInventoryList | null>;
      }),
    )
      .then((newInventoryProviders) => {
        newInventoryProviders.map((newInventoryProvider) =>
          newInventory[newInventoryProvider?.type].push(newInventoryProvider),
        );

        return newInventory;
      })
      .catch(() => {
        //   throw error;
        return null;
      });

    return allPromises;
  };

  /**
   * Handles any errors thrown when trying to fetch the inventory.
   * If the error is new (compared to the last error),
   * it sets the error state and stops the loading state.
   *
   * @param {Error} e The error object to handle
   * @returns {void}
   */
  const handleError = (e: Error | null): void => {
    if (e?.toString() !== oldErrorRef.current) {
      setError(e);
      setLoading(false);

      oldErrorRef.current = e?.toString() ?? null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newInventory: ProvidersInventoryList = canList
          ? await consoleFetchJSON(getInventoryApiUrl(`providers?detail=1`))
          : await getInventoryByNamespace(namespace);

        updateInventoryIfChanged(
          newInventory,
          setInventory,
          oldDataRef,
          setLoading,
          DEFAULT_FIELDS_TO_AVOID_COMPARING,
        );
        handleError(null);
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
