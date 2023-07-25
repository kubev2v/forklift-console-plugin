import {
  CommonMapping,
  OwnerRef,
  resolveOwnerRef,
  toStatus,
  useMappings,
} from 'src/components/mappings/data';
import * as C from 'src/utils/constants';
import { useNetworkMappings } from 'src/utils/fetch';
import { groupVersionKindForObj, resolveProviderRef } from 'src/utils/resources';
import { NetworkMapResource, ProviderRef } from 'src/utils/types';

import {
  IdNameNamespaceTypeRef,
  INameNamespaceRef,
  INetworkMapping,
  INetworkMappingItem,
} from '@kubev2v/legacy/queries/types';
import { V1beta1NetworkMapStatusConditions, V1beta1Provider } from '@kubev2v/types';
import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

export interface FlatNetworkMapping extends CommonMapping {
  [C.FROM]: [Network, IdNameNamespaceTypeRef[]][];
  [C.TO]: Network[];
  [C.OBJECT]: INetworkMapping;
}

const groupMultusNetworks = (
  tuples: [INameNamespaceRef, IdNameNamespaceTypeRef][],
): [RemoteNetworkResource, IdNameNamespaceTypeRef[]][] => {
  const namespaceNameTree = tuples.reduce(
    (acc, [{ name, namespace }, source]) => ({
      ...acc,
      [namespace]: { ...acc[namespace], [name]: [...(acc[namespace]?.[name] ?? []), source] },
    }),
    {} as { [k: string]: { [l: string]: IdNameNamespaceTypeRef[] } },
  );
  return Object.entries(namespaceNameTree).flatMap(([namespace, nameToSrc]) =>
    Object.entries(nameToSrc).map(
      ([name, sourceNetworks]): [RemoteNetworkResource, IdNameNamespaceTypeRef[]] => [
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

export const groupByTarget = (
  networkItems: INetworkMappingItem[] = [],
): [Network, IdNameNamespaceTypeRef[]][] => {
  const types = networkItems.reduce(
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

  const podNet: [Network, IdNameNamespaceTypeRef[]][] = types.pod.length
    ? [[{ name: '', type: 'pod' }, types.pod.map((it) => it.source)]]
    : [];

  return [
    ...podNet,
    ...groupMultusNetworks(
      types.multus.map(({ source, destination }): [INameNamespaceRef, IdNameNamespaceTypeRef] => [
        destination as INameNamespaceRef,
        source,
      ]),
    ),
  ];
};

export const mergeData = (
  mappings: NetworkMapResource[],
  providers: V1beta1Provider[],
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
        [Network, IdNameNamespaceTypeRef[]][],
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
        groupByTarget(mapping.spec.map),
        resolveOwnerRef(mapping.metadata.ownerReferences),
      ],
    )
    .map(
      ([
        {
          metadata: { name, namespace, annotations = [] },
          status: { conditions = [] } = {},
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
        managed: !!owner.name,
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
        status: toStatus(conditions),
        conditions: conditions as V1beta1NetworkMapStatusConditions[],
        object: mapping,
      }),
    );
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
}): [FlatNetworkMapping[], boolean, boolean] => {
  return useMappings<NetworkMapResource, FlatNetworkMapping>(
    { namespace, name },
    useNetworkMappings,
    mergeData,
  );
};
