import { useEffect, useState } from 'react';

import { V1Secret } from '@kubev2v/types';
import { useK8sWatchResource, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Type for the return value of the useK8sWatchSecretData hook.
 */
type K8sSecretWatchResult = [Record<string, string> | undefined, boolean, Error | null];

/**
 * React hook to watch a specific Kubernetes Secret resource and only trigger re-renders when the Secret's `data` changes.
 *
 * @param {WatchK8sResource} resourceParams - Parameters specifying the Kubernetes Secret to watch.
 * @returns {K8sSecretWatchResult} - An array containing the Secret's data (or `null` if not loaded), a boolean indicating if the data has been loaded, and any error that occurred while loading.
 */
export const useK8sWatchSecretData = (resourceParams: WatchK8sResource): K8sSecretWatchResult => {
  const [secretData, setSecretData] = useState<Record<string, string> | undefined>(undefined);
  const [secretLoaded, setLoaded] = useState(false);
  const [secretLoadError, setLoadError] = useState<Error | null>(null);

  const [secret, loaded, error] = useK8sWatchResource<V1Secret>(resourceParams);

  useEffect(() => {
    if (loaded && error) {
      handleLoadError(error);
    } else if (loaded) {
      handleLoadedSecret(secret);
    }
  }, [secret, loaded, error]);

  const handleLoadError = (error: Error | null) => {
    setLoadError(error);
    setLoaded(true);
  };

  const handleLoadedSecret = (secret: V1Secret | null) => {
    setLoaded(true);
    if (JSON.stringify(secret?.data) !== JSON.stringify(secretData)) {
      setSecretData(secret?.data);
    }
  };

  return [secretData, secretLoaded, secretLoadError];
};
