import {
  CommonMapping,
  OwnerRef,
  resolveOwnerRef,
  toStatus,
  useMappings,
} from 'src/components/mappings/data';
import * as C from 'src/utils/constants';
import { useStorageMappings } from 'src/utils/fetch';
import { groupVersionKindForObj, resolveProviderRef } from 'src/utils/resources';
import { ProviderRef, StorageMapResource } from 'src/utils/types';

import { IdNameNamespaceTypeRef, IStorageMapping } from '@kubev2v/legacy/queries/types';
import { V1beta1Provider, V1beta1StorageMapStatusConditions } from '@kubev2v/types';
import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

export interface Storage {
  name: string;
}

export interface FlatStorageMapping extends CommonMapping {
  [C.FROM]: [Storage, IdNameNamespaceTypeRef[]][];
  [C.TO]: Storage[];
  [C.OBJECT]: IStorageMapping;
}

/**
 * Group networks by target network. It's many(sources)-to-one(target) mapping.
 *
 * @example
 * Input: [
 *  ["large", { id: "123" }],
 *  ["large", { name: "foo" }]
 * ]
 * Output: [
 *  [{ name: "large"} , [
 *      { id: "123" },
 *      { name: "foo" }
 *    ]
 *  ]
 * ]
 */
export const groupByTarget = (
  tuples: [string, IdNameNamespaceTypeRef][],
): [Storage, IdNameNamespaceTypeRef[]][] =>
  Object.entries(
    tuples.reduce(
      (acc, [targetStorageName, sourceStorage]) => ({
        ...acc,
        [targetStorageName]: [...(acc[targetStorageName] ?? []), sourceStorage],
      }),
      {} as { [k: string]: IdNameNamespaceTypeRef[] },
    ),
  ).map(([targetStorageName, sources]) => [{ name: targetStorageName }, sources]);

export const mergeData = (
  mappings: StorageMapResource[],
  providers: V1beta1Provider[],
): FlatStorageMapping[] => {
  return mappings
    .map(
      (
        mapping,
      ): [
        StorageMapResource,
        StorageMapResource,
        K8sGroupVersionKind,
        ProviderRef,
        ProviderRef,
        OwnerRef,
        [Storage, IdNameNamespaceTypeRef[]][],
      ] => [
        mapping, // to extract props
        mapping, // to pass as object blob
        groupVersionKindForObj(mapping),
        resolveProviderRef(mapping.spec.provider.source, providers),
        resolveProviderRef(mapping.spec.provider.destination, providers),
        resolveOwnerRef(mapping.metadata.ownerReferences),
        groupByTarget(
          mapping.spec.map.map(({ destination, source }) => [destination.storageClass, source]),
        ),
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
        owner,
        groupedStorages,
      ]): FlatStorageMapping => ({
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
        object: mapping,
        to: groupedStorages.map(([storage]) => storage),
        from: groupedStorages,
        status: toStatus(conditions),
        conditions: conditions as V1beta1StorageMapStatusConditions[],
      }),
    );
};

export const useFlatStorageMappings = ({
  namespace,
  name = undefined,
}): [FlatStorageMapping[], boolean, boolean] => {
  return useMappings<StorageMapResource, FlatStorageMapping>(
    { namespace, name },
    useStorageMappings,
    mergeData,
  );
};
