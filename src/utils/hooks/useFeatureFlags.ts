import { useMemo } from 'react';

import { ForkliftControllerModelGroupVersionKind } from '@kubev2v/types';
import {
  type K8sResourceKind,
  useActiveNamespace,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

type FeatureFlagsResult = {
  isFeatureEnabled: (featureName: string) => boolean;
};

/**
 * Provides access to feature flags defined in the ForkliftController.
 *
 * Flags are read from the `spec` of the first ForkliftController found in the current
 * or specified namespace. A flag is considered enabled if its value is the string 'true'.
 *
 * @param namespace - Namespace to watch for the ForkliftController. Defaults to the active namespace.
 */
export const useFeatureFlags = (namespace?: string): FeatureFlagsResult => {
  const [activeNamespace] = useActiveNamespace();
  const [forkliftControllers, loaded, error] = useK8sWatchResource<K8sResourceKind[]>({
    groupVersionKind: ForkliftControllerModelGroupVersionKind,
    isList: true,
    namespace: namespace ?? activeNamespace,
    namespaced: true,
  });

  // Use the first available ForkliftController
  const forkliftController = useMemo(() => forkliftControllers?.[0], [forkliftControllers]);

  const isFeatureEnabled = useMemo(() => {
    return (featureName: string): boolean => {
      // If still loading or errored or no controller found, return false
      if (!loaded || error || !forkliftController) {
        return false;
      }

      // Feature flags are stored as string fields in the controller's `spec`
      const spec = forkliftController.spec ?? {};

      return spec[featureName] === 'true';
    };
  }, [loaded, error, forkliftController]);

  return { isFeatureEnabled };
};
