import { useMemo } from 'react';
import { CONFIG_MAP_GVK } from 'src/plans/create/steps/customization-scripts/constants';
import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';

import type { IoK8sApiCoreV1ConfigMap, V1beta1Plan } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import { parseConfigMapScripts } from '../utils/parseConfigMapScripts';

type UsePlanCustomScriptsResult = {
  configMap: IoK8sApiCoreV1ConfigMap | undefined;
  error: Error | null;
  loaded: boolean;
  scripts: CustomScript[];
};

export const usePlanCustomScripts = (plan: V1beta1Plan): UsePlanCustomScriptsResult => {
  const customizationScriptsRef = plan?.spec?.customizationScripts;
  const hasRef = !isEmpty(customizationScriptsRef?.name);

  const [configMap, loaded, error] = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
    hasRef
      ? {
          groupVersionKind: CONFIG_MAP_GVK,
          name: customizationScriptsRef?.name,
          namespace: customizationScriptsRef?.namespace,
          namespaced: true,
        }
      : null,
  );

  // Serialize configMap.data to a stable string for useMemo dependency —
  // the watch result object reference can change even when data has not.
  const configMapDataJson = JSON.stringify(configMap?.data ?? null);

  const scripts = useMemo((): CustomScript[] => {
    if (!hasRef) {
      return [];
    }
    const parsed = JSON.parse(configMapDataJson) as Record<string, string> | null;
    return parseConfigMapScripts(parsed ?? undefined);
  }, [configMapDataJson, hasRef]);

  if (!hasRef) {
    return { configMap: undefined, error: null, loaded: true, scripts: [] };
  }

  return { configMap, error, loaded, scripts };
};
