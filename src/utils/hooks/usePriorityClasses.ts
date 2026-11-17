import { useMemo } from 'react';

import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { PRIORITY_CLASS_GVK } from '@utils/constants';

import { useK8sWatchResource } from './useK8sWatchResource';

type PriorityClass = K8sResourceCommon;

type UsePriorityClasses = () => {
  loaded: boolean;
  loadError: Error | null;
  priorityClasses: string[];
};

export const usePriorityClasses: UsePriorityClasses = () => {
  const [resources, loaded, loadError] = useK8sWatchResource<PriorityClass[]>({
    groupVersionKind: PRIORITY_CLASS_GVK,
    isList: true,
  });

  const priorityClasses = useMemo(
    () =>
      (resources ?? [])
        .flatMap((priorityClass) => {
          const name = priorityClass.metadata?.name;
          return name ? [name] : [];
        })
        .sort((first, second) => first.localeCompare(second)),
    [resources],
  );

  return { loaded, loadError, priorityClasses };
};
