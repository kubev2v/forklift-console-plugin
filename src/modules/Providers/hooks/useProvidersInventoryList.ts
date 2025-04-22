import { useEffect, useRef, useState } from 'react';

import {
  type ProviderInventory,
  ProviderModel,
  type ProvidersInventoryList,
  type V1beta1Provider,
} from '@kubev2v/types';
import { consoleFetchJSON, k8sGet, useFlag } from '@openshift-console/dynamic-plugin-sdk';

import { getInventoryApiUrl } from '../utils/helpers/getApiUrl';
import { hasObjectChangedInGivenFields } from '../utils/helpers/hasObjectChangedInGivenFields';

import { DEFAULT_FIELDS_TO_AVOID_COMPARING } from './utils/constants';

const INVENTORY_TYPES: string[] = ['openshift', 'openstack', 'ovirt', 'vsphere', 'ova'];

/**
 * Configuration parameters for useProvidersInventoryList hook.
 * @interface
 * @property {string} namespace - namespace for fetching inventory's providers data for. Used only for users with limited namespaces privileges.
 * @property {number} interval - Polling interval in milliseconds.
 */
type UseInventoryParams = {
  namespace?: string;
  interval?: number; // Polling interval in milliseconds
};

/**
 * The result object from useProvidersInventoryList hook.
 * @interface
 * @property {ProvidersInventoryList | null} inventory - The fetched inventory data, or null if loading, not fetched yet, or error.
 * @property {boolean} loading - Indicates whether the inventory data is currently being fetched.
 * @property {Error | null} error - Any error that occurred when fetching the inventory data, or null if no errors.
 */
type UseInventoryResult = {
  inventory: ProvidersInventoryList | null;
  loading: boolean;
  error: Error | null;
};

/**
 * A React hook to fetch and maintain an up-to-date list of providers' inventory data, belongs to a given namespace or to all namespaces
 * (based on the namespace parameter).
 * For users with limited namespaces privileges, only the given namespace's providers inventory data are fetched.
 * It fetches data on mount and then at the specified interval.
 *
 * @param {UseInventoryParams} params - Configuration parameters for the hook.
 * @param {string} namespace - namespace to fetch providers' inventory data for. if set to null, then fetch for all namespaces.
 * @param {number} [params.interval=10000] - Interval (in milliseconds) to fetch new data at.
 *
 * @returns {UseInventoryResult} result - Contains the inventory data, the loading state, and the error state.
 */
const useProvidersInventoryList = ({
  interval = 20000,
  namespace = null,
}: UseInventoryParams): UseInventoryResult => {
  const [inventory, setInventory] = useState<ProvidersInventoryList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const oldDataRef = useRef(null);
  const oldErrorRef = useRef(null);
  const canList: boolean = useFlag('CAN_LIST_NS');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newInventory: ProvidersInventoryList = canList
          ? await consoleFetchJSON(getInventoryApiUrl(`providers?detail=1`)) // Fetch all providers
          : await getInventoryByNamespace(namespace); // Fetch single namespace's providers

        updateInventoryIfChanged(newInventory, DEFAULT_FIELDS_TO_AVOID_COMPARING);
        handleError(null);
      } catch (e) {
        handleError(e);
      }
    };

    (async () => {
      await fetchData();
    })();

    const intervalId = setInterval(fetchData, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, [interval, namespace]);

  /**
   * Fetching providers list by namespace.
   *
   * @param {string} namespace to fetch providers by.
   * @returns {Promise<V1beta1Provider[]>} providers list by namespace.
   */
  const k8sGetProviders = async (namespace: string): Promise<V1beta1Provider[]> => {
    type K8sListResponse<T> = {
      items: T[];
    };
    const providersList = await k8sGet({ model: ProviderModel, ns: namespace });

    return (providersList as K8sListResponse<V1beta1Provider>)?.items;
  };

  /**
   * For users with limited namespaces privileges, fetch only the given namespace's providers.
   *
   * @param {string} namespace namespace to fetch providers' inventory data for.
   * @returns {void}
   */
  const getInventoryByNamespace = async (namespace: string): Promise<ProvidersInventoryList> => {
    const newInventory: ProvidersInventoryList = {
      openshift: [],
      openstack: [],
      ova: [],
      ovirt: [],
      vsphere: [],
    };

    const providers = await k8sGetProviders(namespace);

    const readyProviders = providers?.filter(
      (provider: V1beta1Provider) => provider.status.phase === 'Ready',
    );

    const inventoryProviderURL = (provider: V1beta1Provider) =>
      `providers/${provider.spec.type}/${provider.metadata.uid}`;

    const allPromises = Promise.all(
      readyProviders.map(async (provider) => {
        return consoleFetchJSON(getInventoryApiUrl(inventoryProviderURL(provider)));
      }),
    )
      .then((newInventoryProviders) => {
        newInventoryProviders.map((newInventoryProvider) =>
          newInventory[newInventoryProvider.type].push(newInventoryProvider),
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
  const handleError = (e: Error): void => {
    if (e?.toString() !== oldErrorRef.current?.error) {
      setError(e);
      setLoading(false);

      oldErrorRef.current = { error: e?.toString() };
    }
  };

  /**
   * Checks if there have been changes to any inventory items, and if so,
   * updates the inventory list, sets the loading status to false,
   * and updates the reference to the old data.
   *
   * @param newInventoryList - The new inventory list.
   * @param fieldsToAvoidComparing - The fields to ignore comparing in order to determine if an inventory item has changed.
   *
   * @returns {void}
   */
  const updateInventoryIfChanged = (
    newInventoryList: ProvidersInventoryList,
    fieldsToAvoidComparing: string[],
  ): void => {
    // Calculate total lengths of old and new inventories.
    const oldTotalLength = INVENTORY_TYPES.reduce(
      (total, type) => total + (oldDataRef.current?.inventoryList?.[type]?.length || 0),
      0,
    );
    const newTotalLength = INVENTORY_TYPES.reduce(
      (total, type) => total + (newInventoryList[type]?.length || 0),
      0,
    );

    const hasInventorySizeChanged = oldTotalLength !== newTotalLength;
    let needReRender = hasInventorySizeChanged;

    // Test if inventory items changed
    if (!hasInventorySizeChanged && oldTotalLength !== 0) {
      const oldFlatInventory = INVENTORY_TYPES.flatMap<ProviderInventory>(
        (type) => oldDataRef.current?.inventoryList?.[type] || [],
      );
      const newFlatInventory = INVENTORY_TYPES.flatMap<ProviderInventory>(
        (type) => newInventoryList[type] || [],
      );

      // Create maps of old and new inventories, using 'uid' as the key.
      const oldInventoryMap = new Map(oldFlatInventory.map((item) => [item.uid, item]));
      const newInventoryMap = new Map(newFlatInventory.map((item) => [item.uid, item]));

      for (const [uid, oldItem] of oldInventoryMap) {
        const newItem = newInventoryMap.get(uid);

        // If a matching item is not found in the new list, or the item has changed, we need to re-render.
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
      oldDataRef.current = { inventoryList: newInventoryList };
    }
  };

  return { error, inventory, loading };
};

export default useProvidersInventoryList;
