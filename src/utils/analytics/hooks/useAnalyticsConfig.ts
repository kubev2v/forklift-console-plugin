import { useMemo } from 'react';

import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { ConfigMapModel, ConsoleConfigMap, TelemetryConfigField } from '../constants';
import type { AnalyticsConfig, ConsoleConfigMap as ConsoleConfigMapType } from '../types';

/**
 * Hook to get analytics configuration from console-config ConfigMap
 */
export const useAnalyticsConfig = (): AnalyticsConfig => {
  const [configMap, loaded] = useK8sWatchResource<ConsoleConfigMapType>({
    groupVersionKind: getGroupVersionKindForModel(ConfigMapModel),
    name: ConsoleConfigMap.Name,
    namespace: ConsoleConfigMap.Namespace,
  });

  return useMemo(() => {
    const yamlContent = configMap?.data?.['console-config.yaml'];

    if (!loaded || !yamlContent) {
      return { clusterId: '', segmentKey: '' };
    }

    const segmentKeyName =
      process.env.NODE_ENV === 'development'
        ? TelemetryConfigField.DevSegmentApiKey
        : TelemetryConfigField.SegmentPublicApiKey;

    const segmentKey =
      new RegExp(`${segmentKeyName}:\\s*(?<key>.+)`, 'u').exec(yamlContent)?.groups?.key?.trim() ??
      '';

    const clusterId =
      new RegExp(`${TelemetryConfigField.ClusterId}:\\s*(?<id>.+)`, 'u')
        .exec(yamlContent)
        ?.groups?.id?.trim() ?? '';

    return { clusterId, segmentKey };
  }, [configMap, loaded]);
};
