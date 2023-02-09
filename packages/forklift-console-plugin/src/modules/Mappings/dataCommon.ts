import { useMemo } from 'react';
import { Mapping } from 'legacy/src/queries/types';
import * as C from 'src/utils/constants';
import { useProviders } from 'src/utils/fetch';
import { groupVersionKindForObj, ResourceKind } from 'src/utils/resources';
import { ProviderResource } from 'src/utils/types';

import {
  K8sGroupVersionKind,
  OwnerReference,
  WatchK8sResource,
  WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';

export interface CommonMapping {
  [C.NAME]: string;
  [C.NAMESPACE]: string;
  [C.GVK]: K8sGroupVersionKind;
  [C.SOURCE]: string;
  [C.SOURCE_GVK]: K8sGroupVersionKind;
  [C.SOURCE_RESOLVED]: boolean;
  [C.SOURCE_READY]: boolean;
  [C.TARGET]: string;
  [C.TARGET_GVK]: K8sGroupVersionKind;
  [C.TARGET_RESOLVED]: boolean;
  [C.TARGET_READY]: boolean;
  [C.TEMPLATE]: boolean;
  [C.OWNER]: string;
  [C.OWNER_GVK]: K8sGroupVersionKind;
  [C.OBJECT]: Mapping;
}

export interface OwnerRef {
  name?: string;
  gvk?: K8sGroupVersionKind;
}

export const resolveOwnerRef = ([first, second]: OwnerReference[] = []): OwnerRef => {
  // expect only one owner - the plan
  if (!first || first.kind != ResourceKind.Plan || second) {
    return {};
  }

  return { name: first.name, gvk: groupVersionKindForObj(first) };
};

export const useMappings = <T, K>(
  {
    namespace,
    name = undefined,
    groupVersionKind: { group, version },
  }: { namespace: string; name?: string; groupVersionKind: K8sGroupVersionKind },
  useMappings: (p: WatchK8sResource, k: Omit<K8sGroupVersionKind, 'kind'>) => WatchK8sResult<T[]>,
  mergeData: (m: T[], p: ProviderResource[]) => K[],
): [K[], boolean, boolean] => {
  const [providers] = useProviders({ namespace }, { group, version });
  const [mappings, loaded, error] = useMappings({ namespace, name }, { group, version });

  const merged = useMemo(
    () => (mappings && providers ? mergeData(mappings, providers) : []),
    [mappings, providers],
  );
  // extra memo to keep the tuple reference stable
  // the tuple is used as data source and passed as prop
  // which triggres unnecessary re-renders
  return useMemo(() => [merged, loaded, error], [merged, loaded, error]);
};
