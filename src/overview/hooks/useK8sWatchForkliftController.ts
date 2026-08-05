import { useMemo } from 'react';

import {
  ForkliftControllerModelGroupVersionKind,
  type V1beta1ForkliftController,
} from '@forklift-ui/types';
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
  const [controllers, loaded, loadError] = useK8sWatchResource<V1beta1ForkliftController[]>({
    groupVersionKind: ForkliftControllerModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });

  const controller = useMemo(() => {
    const [firstController] = controllers ?? [];
    return firstController;
  }, [controllers]);

  return [controller, loaded, (loadError as Error | null) ?? null];
};
