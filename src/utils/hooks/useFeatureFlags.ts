import { useMemo } from 'react';

import { ForkliftControllerModelGroupVersionKind } from '@forklift-ui/types';
import { type K8sResourceKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { FEATURE_FLAG_DEFAULTS } from '@utils/constants';
import { getDefaultNamespace } from '@utils/namespaces';

type FeatureFlagsResult = {
  isFeatureEnabled: (featureName: string) => boolean;
};

/**
 * Provides access to feature flags defined in the ForkliftController.
 *
 * Flags are read from the `spec` of the first ForkliftController found in the current
 * or specified namespace. A flag is considered enabled if its value is the boolean true
 * or the string 'true'. If a flag is not explicitly set in the CR, the default value from
 * FEATURE_FLAG_DEFAULTS is used. If no default exists, the flag is considered disabled.
 *
 * @param namespace - Namespace to watch for the ForkliftController. Defaults to the default namespace of forklift (openshift-mtv for DS/ konveyor-forklift for US).
 */
export const useFeatureFlags = (namespace?: string): FeatureFlagsResult => {
  const [forkliftControllers, loaded, error] = useK8sWatchResource<K8sResourceKind[]>({
    groupVersionKind: ForkliftControllerModelGroupVersionKind,
    isList: true,
    namespace: namespace ?? getDefaultNamespace(),
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

      // Feature flags are stored as fields in the controller's `spec`
      const spec = forkliftController.spec ?? {};
      const featureValue = spec[featureName];

      // If feature is explicitly set in the CR, use that value
      if (featureValue) {
        // Consider enabled if value is boolean true or string 'true'
        return featureValue === true || featureValue === 'true';
      }

      // If not set in CR, check for default value in constants or false
      return FEATURE_FLAG_DEFAULTS[featureName] ?? false;
    };
  }, [loaded, error, forkliftController]);

  return { isFeatureEnabled };
};
