import { useMemo } from 'react';

import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import {
  type ClusterInstanceType,
  DISPLAY_NAME_ANNOTATION,
  INSTANCE_TYPE_GVK,
  type InstanceTypeOption,
} from './constants';

type UseClusterInstanceTypes = () => {
  instanceTypes: InstanceTypeOption[];
  loaded: boolean;
  loadError: Error | null;
};

const buildDescription = (instanceType: ClusterInstanceType): string => {
  const displayName = instanceType.metadata?.annotations?.[DISPLAY_NAME_ANNOTATION];
  const cpu = instanceType.spec?.cpu?.guest;
  const memory = instanceType.spec?.memory?.guest;
  const specs = cpu && memory ? `${cpu} CPU, ${memory} memory` : '';

  if (displayName && specs) {
    return `${displayName} | ${specs}`;
  }

  return displayName ?? specs;
};

export const useClusterInstanceTypes: UseClusterInstanceTypes = () => {
  const [resources, loaded, loadError] = useK8sWatchResource<ClusterInstanceType[]>({
    groupVersionKind: INSTANCE_TYPE_GVK,
    isList: true,
  });

  const instanceTypes = useMemo(
    () =>
      (resources ?? [])
        .filter(
          (instanceType): instanceType is ClusterInstanceType & { metadata: { name: string } } =>
            Boolean(instanceType.metadata?.name),
        )
        .sort((a, b) => a.metadata.name.localeCompare(b.metadata.name))
        .map((instanceType) => ({
          description: buildDescription(instanceType),
          name: instanceType.metadata.name,
        })),
    [resources],
  );

  return { instanceTypes, loaded, loadError };
};
