import { useEffect, useMemo, useRef, useState } from 'react';

import type { V1beta1Provider } from '@kubev2v/types';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

import { getInventoryApiUrl } from '../utils/helpers/getApiUrl';
import { hasObjectChangedInGivenFields } from '../utils/helpers/hasObjectChangedInGivenFields';

import { DEFAULT_FIELDS_TO_AVOID_COMPARING } from './utils/constants';

/**
 * @typedef {Object} UseProviderInventoryParams
 *
 * @property {V1beta1Provider} provider - The provider from which the inventory is fetched.
 * @property {string} [subPath] - The sub path to be used in the inventory fetch API URL.
 * @property {string[]} [fieldsToAvoidComparing] - The fields to ignore comparing when checking if the inventory has changed.
 * @property {number} [interval] - The polling interval in milliseconds.
 * @property {number} [fetchTimeout] - The fetch timeout in milliseconds.
 * @property {number} [cacheExpiryDuration] - Duration in milliseconds till the cache remains valid.
 * @param {boolean} [disabled] - Prevent query execution.
 */
export type UseProviderInventoryParams = {
  provider: V1beta1Provider | undefined;
  subPath?: string;
  fieldsToAvoidComparing?: string[];
  interval?: number;
  fetchTimeout?: number;
  disabled?: boolean;
};

/**
 * @typedef {Object} UseProviderInventoryResult
 *
 * @property {T | null} inventory - The fetched inventory.
 * @property {boolean} loading - Whether the inventory fetch is in progress.
 * @property {Error | null} error - The error occurred during inventory fetch.
 */
type UseProviderInventoryResult<T> = {
  inventory: T | null;
  loading: boolean;
  error: Error | null;
};

/**
 * A React hook to fetch and cache inventory data from a provider.
 * It fetches new data on mount and then at the specified interval.
 * If the new data is the same as the old data (compared ignoring specified fields, if exist),
 * it does not update the state to prevent unnecessary re-renders.
 *
 * @param {Object} useProviderInventoryParams Configuration parameters for the hook
 * @param {Object} useProviderInventoryParams.provider Provider object to get inventory data from
 * @param {string} [useProviderInventoryParams.subPath=''] Sub-path to append to the provider API URL
 * @param {Array} [useProviderInventoryParams.fieldsToAvoidComparing=DEFAULT_FIELDS_TO_AVOID_COMPARING] Fields to ignore when comparing new data with old data
 * @param {number} [useProviderInventoryParams.interval=10000] Interval (in milliseconds) to fetch new data at
 * @param {boolean} [useProviderInventoryParams.disabled=false] Prevent query execution.
 *
 * @returns {Object} useProviderInventoryResult Contains the inventory data (or null if loading, not fetched yet, or error),
 * the loading state, and the error state (or null if no errors)
 *
 * @template T Type of the inventory data
 */
const useProviderInventory = <T>({
  disabled = false,
  fetchTimeout,
  fieldsToAvoidComparing = DEFAULT_FIELDS_TO_AVOID_COMPARING,
  interval = 20000,
  provider,
  subPath = '',
}: UseProviderInventoryParams): UseProviderInventoryResult<T> => {
  const [inventory, setInventory] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const oldDataRef = useRef<{ inventory: T | null } | null>(null);
  const oldErrorRef = useRef<{ error: string } | null>(null);

  // we only use type and uid in this context
  const stableProvider = useMemo(() => provider, [provider?.spec?.type, provider?.metadata?.uid]);

  // Fetch data from API
  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      if (disabled) {
        return;
      }
      if (!isValidProvider(provider)) {
        const e = new Error('Invalid provider data');
        handleError(e);

        return;
      }

      try {
        const newInventory = await consoleFetchJSON(
          getInventoryApiUrl(
            `providers/${provider?.spec?.type}/${provider?.metadata?.uid}${
              subPath ? `/${subPath}` : ''
            }`,
          ),
          'GET',
          {},
          fetchTimeout,
        );

        updateInventoryIfChanged(newInventory, fieldsToAvoidComparing);
        setError(null);
      } catch (e) {
        updateInventoryIfChanged(null, []);

        if (e instanceof Error) {
          handleError(e);
        }
      } finally {
        setLoading(false);
      }
    };

    (async () => {
      await fetchData();
    })();

    const intervalId = setInterval(fetchData, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, [stableProvider, subPath, interval, disabled]);

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
      oldErrorRef.current = { error: e?.toString() };
    }
  };

  /**
   * Checks if provider object is valid.
   * @param {V1beta1Provider} provider - The provider object to be validated.
   * @returns {boolean} - True if the provider object is valid, false otherwise.
   */
  const isValidProvider = (provider: V1beta1Provider): boolean => {
    return provider?.spec?.type !== undefined && provider?.metadata?.uid !== undefined;
  };

  /**
   * Checks if the inventory data has changed and updates the inventory state if it has.
   * Also updates the loading state.
   * @param {T} newInventory - The new inventory data.
   * @param {string[]} fieldsToAvoidComparing - The fields to ignore comparing when checking if the inventory data has changed.
   */
  const updateInventoryIfChanged = (newInventory: T, fieldsToAvoidComparing: string[]): void => {
    const needReRender = hasObjectChangedInGivenFields({
      fieldsToAvoidComparing,
      newObject: newInventory,
      oldObject: oldDataRef.current?.inventory,
    });

    if (needReRender) {
      setInventory(newInventory);
      oldDataRef.current = { inventory: newInventory };
    }
  };

  return disabled
    ? { error: null, inventory: null, loading: false }
    : { error, inventory, loading };
};

export default useProviderInventory;
