import { useEffect, useRef, useState } from 'react';

import { ProviderInventory, ProvidersInventoryList } from '@kubev2v/types';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

import { getInventoryApiUrl, hasObjectChangedInGivenFields } from '../utils';

import { DEFAULT_FIELDS_TO_COMPARE } from './utils';

const INVENTORY_TYPES: string[] = ['openshift', 'openstack', 'ovirt', 'vsphere', 'ova'];

/**
 * Configuration parameters for useProvidersInventoryList hook.
 * @interface
 * @property {number} interval - Polling interval in milliseconds.
 */
interface UseInventoryParams {
  interval?: number; // Polling interval in milliseconds
}

/**
 * The result object from useProvidersInventoryList hook.
 * @interface
 * @property {ProvidersInventoryList | null} inventory - The fetched inventory data, or null if loading, not fetched yet, or error.
 * @property {boolean} loading - Indicates whether the inventory data is currently being fetched.
 * @property {Error | null} error - Any error that occurred when fetching the inventory data, or null if no errors.
 */
interface UseInventoryResult {
  inventory: ProvidersInventoryList | null;
  loading: boolean;
  error: Error | null;
}

/**
 * A React hook to fetch and maintain an up-to-date list of providers' inventory data.
 * It fetches data on mount and then at the specified interval.
 *
 * @param {UseInventoryParams} params - Configuration parameters for the hook.
 * @param {number} [params.interval=10000] - Interval (in milliseconds) to fetch new data at.
 *
 * @returns {UseInventoryResult} result - Contains the inventory data, the loading state, and the error state.
 */
export const useProvidersInventoryList = ({
  interval = 20000,
}: UseInventoryParams): UseInventoryResult => {
  const [inventory, setInventory] = useState<ProvidersInventoryList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const oldDataRef = useRef(null);
  const oldErrorRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newInventory: ProvidersInventoryList = await consoleFetchJSON(
          getInventoryApiUrl(`providers?detail=1`),
        );

        updateInventoryIfChanged(newInventory, DEFAULT_FIELDS_TO_COMPARE);
        handleError(null);
      } catch (e) {
        handleError(e);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
  }, [interval]);

  /**
   * Handles any errors thrown when trying to fetch the inventory.
   * If the error is new (compared to the last error),
   * it sets the error state and stops the loading state.
   *
   * @param {Error} e The error object to handle
   * @returns {void}
   */
  function handleError(e: Error): void {
    if (e?.toString() !== oldErrorRef.current?.error) {
      setError(e);
      setLoading(false);

      oldErrorRef.current = { error: e?.toString() };
    }
  }

  /**
   * Checks if there have been changes to any inventory items, and if so,
   * updates the inventory list, sets the loading status to false,
   * and updates the reference to the old data.
   *
   * @param newInventoryList - The new inventory list.
   * @param fieldsToCompare - The fields to compare in order to determine
   *                          if an inventory item has changed.
   *
   * @returns {void}
   */
  function updateInventoryIfChanged(
    newInventoryList: ProvidersInventoryList,
    fieldsToCompare: string[],
  ): void {
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
          hasObjectChangedInGivenFields({ oldObject: oldItem, newObject: newItem, fieldsToCompare })
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
  }

  return { inventory, loading, error };
};

export default useProvidersInventoryList;
