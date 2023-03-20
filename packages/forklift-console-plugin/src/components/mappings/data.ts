import { useMemo } from 'react';
import * as C from 'src/utils/constants';
import { useProviders } from 'src/utils/fetch';
import { groupVersionKindForObj, ResourceKind } from 'src/utils/resources';
import { MappingStatus } from 'src/utils/types';

import { Mapping } from '@kubev2v/legacy/queries/types';
import {
  V1beta1NetworkMapStatusConditions,
  V1beta1Provider,
  V1beta1StorageMapStatusConditions,
} from '@kubev2v/types';
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
  [C.MANAGED]: boolean;
  [C.OBJECT]: Mapping;
  [C.STATUS]: MappingStatus;
  conditions: V1beta1NetworkMapStatusConditions[] | V1beta1StorageMapStatusConditions[];
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

export const toStatus = (
  conditions: V1beta1NetworkMapStatusConditions[] | V1beta1StorageMapStatusConditions[],
): MappingStatus =>
  conditions.find((it) => it.type === 'Ready')?.status === 'True' ? 'Ready' : 'NotReady';

export const useMappings = <T, K>(
  { namespace, name = undefined }: { namespace: string; name?: string },
  useMappings: (p: WatchK8sResource) => WatchK8sResult<T[]>,
  mergeData: (m: T[], p: V1beta1Provider[]) => K[],
): [K[], boolean, boolean] => {
  const [providers] = useProviders({ namespace });
  const [mappings, loaded, error] = useMappings({ namespace, name });

  const merged = useMemo(
    () => (mappings && providers ? mergeData(mappings, providers) : []),
    [mappings, providers],
  );
  // extra memo to keep the tuple reference stable
  // the tuple is used as data source and passed as prop
  // which triggers unnecessary re-renders
  return useMemo(() => [merged, loaded, error], [merged, loaded, error]);
};
