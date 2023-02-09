import { useMemo } from 'react';
import {
  IdOrNameRef,
  INameNamespaceRef,
  INetworkMapping,
  INetworkMappingItem,
} from 'legacy/src/queries/types';
import * as C from 'src/utils/constants';
import { useNetworkMappings, useProviders } from 'src/utils/fetch';
import { groupVersionKindForObj, resolveProviderRef, ResourceKind } from 'src/utils/resources';
import { NetworkMapResource, ProviderRef, ProviderResource } from 'src/utils/types';

import { K8sGroupVersionKind, OwnerReference } from '@openshift-console/dynamic-plugin-sdk';

export interface FlatNetworkMapping {
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
  [C.FROM]: [Network, IdOrNameRef[]][];
  [C.TO]: Network[];
  [C.TEMPLATE]: boolean;
  [C.OWNER]: string;
  [C.OWNER_GVK]: K8sGroupVersionKind;
  [C.OBJECT]: INetworkMapping;
}

const groupMultusNetworks = (
  tuples: [INameNamespaceRef, IdOrNameRef][],
): [RemoteNetworkResource, IdOrNameRef[]][] => {
  const namespaceNameTree = tuples.reduce(
    (acc, [{ name, namespace }, source]) => ({
      ...acc,
      [namespace]: { ...acc[namespace], [name]: [...(acc[namespace]?.[name] ?? []), source] },
    }),
    {} as { [k: string]: { [l: string]: IdOrNameRef[] } },
  );
  return Object.entries(namespaceNameTree).flatMap(([namespace, nameToSrc]) =>
    Object.entries(nameToSrc).map(
      ([name, sourceNetworks]): [RemoteNetworkResource, IdOrNameRef[]] => [
        {
          name,
          namespace,
          type: 'multus',
        },
        sourceNetworks,
      ],
    ),
  );
};

const groupByTarget = (m: NetworkMapResource): [Network, IdOrNameRef[]][] => {
  const types = m.spec.map.reduce(
    (acc, it) => ({
      pod: [...acc.pod, ...(it.destination.type === 'pod' ? [it] : [])],
      multus: [...acc.multus, ...(it.destination.type === 'multus' ? [it] : [])],
    }),
    {
      pod: [],
      multus: [],
    } as {
      pod: INetworkMappingItem[];
      multus: INetworkMappingItem[];
    },
  );

  const podNet: [Network, IdOrNameRef[]][] = types.pod.length
    ? [[{ name: '', type: 'pod' }, types.pod.map((it) => it.source)]]
    : [];

  return [
    ...podNet,
    ...groupMultusNetworks(
      types.multus.map(({ source, destination }): [INameNamespaceRef, IdOrNameRef] => [
        destination as INameNamespaceRef,
        source,
      ]),
    ),
  ];
};

interface OwnerRef {
  name?: string;
  gvk?: K8sGroupVersionKind;
}

const resolveOwnerRef = ([first, second]: OwnerReference[] = []): OwnerRef => {
  // expect only one owner - the plan
  if (!first || first.kind != ResourceKind.Plan || second) {
    return {};
  }

  return { name: first.name, gvk: groupVersionKindForObj(first) };
};

const mergeData = (
  mappings: NetworkMapResource[],
  providers: ProviderResource[],
): FlatNetworkMapping[] => {
  return mappings
    .map(
      (
        mapping,
      ): [
        NetworkMapResource,
        NetworkMapResource,
        K8sGroupVersionKind,
        ProviderRef,
        ProviderRef,
        [Network, IdOrNameRef[]][],
        OwnerRef,
      ] => [
        mapping, // to extract props
        mapping, // to pass as object blob
        groupVersionKindForObj(mapping),
        resolveProviderRef(mapping.spec.provider.source, providers),
        resolveProviderRef(mapping.spec.provider.destination, providers),
        // future improvement: resolve GVK for local networks:
        // 1. target provider needs to be local
        // 2. fetch available networks - requires 'kind' of CRDs created by Multus CNI
        groupByTarget(mapping),
        resolveOwnerRef(mapping.metadata.ownerReferences),
      ],
    )
    .map(
      ([
        {
          metadata: { name, namespace, annotations = [] },
        },
        mapping,
        gvk,
        sourceProvider,
        targetProvider,
        groupedNetworks,
        owner,
      ]): FlatNetworkMapping => ({
        name,
        namespace,
        template: annotations?.[C.SHARED_MAPPING_ANNOTATION] !== 'false',
        gvk,
        owner: owner.name,
        ownerGvk: owner.gvk,
        source: sourceProvider.name,
        sourceGvk: sourceProvider.gvk,
        sourceResolved: sourceProvider.resolved,
        sourceReady: sourceProvider.ready,
        target: targetProvider.name,
        targetGvk: targetProvider.gvk,
        targetResolved: targetProvider.resolved,
        targetReady: targetProvider.ready,
        from: groupedNetworks,
        to: groupedNetworks.map(([to]) => to),
        object: mapping,
      }),
    )
    .filter((it) => it.template);
};

export interface LocalNetworkResource {
  gvk: K8sGroupVersionKind;
  name: string;
  namespace: string;
  type: 'multus';
}

export interface RemoteNetworkResource {
  name: string;
  namespace: string;
  type: 'multus';
}

export interface PodNetwork {
  name: '';
  type: 'pod';
}

export type Network = LocalNetworkResource | RemoteNetworkResource | PodNetwork;

export const useFlatNetworkMappings = ({
  namespace,
  name = undefined,
  groupVersionKind: { group, version },
}): [FlatNetworkMapping[], boolean, boolean] => {
  const [providers] = useProviders({ namespace }, { group, version });
  const [mappings, loaded, error] = useNetworkMappings({ namespace, name }, { group, version });

  const merged = useMemo(
    () => (mappings && providers ? mergeData(mappings, providers) : []),
    [mappings, providers],
  );
  // extra memo to keep the tuple reference stable
  // the tuple is used as data source and passed as prop
  // which triggres unnecessary re-renders
  return useMemo(() => [merged, loaded, error], [merged, loaded, error]);
};
