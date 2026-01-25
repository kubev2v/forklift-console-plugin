import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_FIELDS_TO_AVOID_COMPARING } from 'src/providers/hooks/utils/constants';
import { getInventoryApiUrl } from 'src/providers/utils/helpers/getApiUrl';
import { hasObjectChangedInGivenFields } from 'src/providers/utils/helpers/hasObjectChangedInGivenFields';

import type { V1beta1Provider } from '@forklift-ui/types';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

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
 * @property {() -> void} forceRefresh - Function to force a data re-fetch
 */
type UseProviderInventoryResult<T> = {
  inventory: T | null;
  loading: boolean;
  error: Error | null;
  forceRefresh: () => void;
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
  const [onRefresh, setOnRefresh] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const oldDataRef = useRef<{ inventory: T | null } | null>(null);
  const oldErrorRef = useRef<{ error: string } | null>(null);
  const providerType = provider?.spec?.type;
  const providerUid = provider?.metadata?.uid;
  const isValidProvider = providerType !== undefined && providerUid !== undefined;

  const forceRefresh = useCallback(() => {
    setOnRefresh((prev) => !prev);
  }, []);

  const handleError = useCallback((fetchError: Error): void => {
    if (fetchError?.toString() !== oldErrorRef.current?.error) {
      setError(fetchError);
      oldErrorRef.current = { error: fetchError?.toString() ?? '' };
    }
  }, []);

  const updateInventoryIfChanged = useCallback(
    (newInventory: T | null, avoidFields: string[]): void => {
      const needReRender = hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: avoidFields,
        newObject: newInventory,
        oldObject: oldDataRef.current?.inventory,
      });

      if (needReRender) {
        setInventory(newInventory);
        oldDataRef.current = { inventory: newInventory };
      }
    },
    [],
  );

  // Fetch data from API
  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      if (disabled) {
        return;
      }
      if (!isValidProvider) {
        const fetchError = new Error('Invalid provider data');
        handleError(fetchError);

        return;
      }

      try {
        const newInventory = (await consoleFetchJSON(
          getInventoryApiUrl(
            `providers/${providerType}/${providerUid}${subPath ? `/${subPath}` : ''}`,
          ),
          'GET',
          {},
          fetchTimeout,
        )) as T;

        updateInventoryIfChanged(
          newInventory,
          fieldsToAvoidComparing ?? DEFAULT_FIELDS_TO_AVOID_COMPARING,
        );
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
  }, [
    handleError,
    updateInventoryIfChanged,
    providerType,
    providerUid,
    isValidProvider,
    subPath,
    interval,
    disabled,
    fieldsToAvoidComparing,
    onRefresh,
    fetchTimeout,
  ]);

  return disabled
    ? { error: null, forceRefresh, inventory: null, loading: false }
    : { error, forceRefresh, inventory, loading };
};

export default useProviderInventory;
