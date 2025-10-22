import { useCallback, useEffect, useState } from 'react';

import {
  ForkliftControllerModelGroupVersionKind,
  type V1beta1ForkliftController,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Type for the return value of the useK8sWatchForkliftController hook.
 */
type K8sForkliftControllerWatchResult = [
  V1beta1ForkliftController | undefined,
  boolean,
  Error | null,
];

/**
 * React hook to watch K8sProvidersWatchResult resources and return the first one.
 *
 * @returns {K8sProvidersWatchResult} - the first forklift controller CR found.
 */
export const useK8sWatchForkliftController = (): K8sForkliftControllerWatchResult => {
  const [controller, setController] = useState<V1beta1ForkliftController | undefined>(undefined);
  const [controllerLoaded, setControllerLoaded] = useState(false);
  const [controllerLoadError, setControllerLoadError] = useState<Error | null>(null);

  const [controllers, loaded, loadError] = useK8sWatchResource<V1beta1ForkliftController[]>({
    groupVersionKind: ForkliftControllerModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });

  const handleLoadError = useCallback((error: Error | null) => {
    setControllerLoadError(error);
    setControllerLoaded(true);
  }, []);

  const handleLoadedForkliftControllers = useCallback(() => {
    setControllerLoaded(true);

    const [firstController] = controllers ?? [];
    setController(firstController);
  }, [controllers]);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    if (loadError) {
      handleLoadError(loadError as Error);
    }
    handleLoadedForkliftControllers();
  }, [controllers, loaded, loadError, handleLoadError, handleLoadedForkliftControllers]);

  return [controller, controllerLoaded, controllerLoadError];
};
