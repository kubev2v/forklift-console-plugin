import { useEffect, useRef, useState } from 'react';
import { getInventoryApiUrl } from 'legacy/src/queries/helpers';

import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Parameters for useProvidersInventoryIsLive hook.
 * @typedef {Object} UseInventoryParams
 * @property {number} [interval=20000] - Time interval to fetch inventory from server, default is 20 seconds.
 */
interface UseInventoryParams {
  interval?: number;
}

/**
 * Result of useProvidersInventoryIsLive hook.
 * @typedef {Object} UseInventoryIsLiveResult
 * @property {boolean} loaded - Whether the server has returned data, indicating it is live.
 * @property {Error|null} loadError - Any error that occurred while checking server, null if no error occurred.
 */
interface UseInventoryIsLiveResult {
  loaded: boolean;
  loadError: Error | null;
}

/**
 * Hook to periodically check server liveliness by attempting to fetch inventory.
 * @param {UseInventoryParams} params - Parameters for the hook.
 * @returns {UseInventoryIsLiveResult} Result of the server check.
 */
export const useProvidersInventoryIsLive = ({
  interval = 20000,
}: UseInventoryParams): UseInventoryIsLiveResult => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const oldErrorRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await consoleFetchJSON(getInventoryApiUrl(`providers`));

        if ('' !== oldErrorRef.current?.error) {
          oldErrorRef.current = { error: '' };
          setLoadError(null);
          setLoaded(true);
        }
      } catch (e) {
        if (e?.toString() !== oldErrorRef.current?.error) {
          oldErrorRef.current = { error: e?.toString() };
          setLoadError(e as Error);
          setLoaded(true);
        }
      }
    };

    fetchData();

    // Polling interval set by the passed parameter
    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
  }, [interval]);

  return { loaded, loadError };
};
