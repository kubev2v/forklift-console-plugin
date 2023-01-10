import {
  MappingSource,
  Mapping,
  MappingItem,
  MappingType,
  IOpenShiftProvider,
  INetworkMappingItem,
  IStorageMappingItem,
  MappingTarget,
  ICommonMapping,
  INetworkMapping,
  IStorageMapping,
  IPlan,
  SourceVM,
  SourceInventoryProvider,
} from '@app/queries/types';
import { IMappingBuilderItem } from './MappingBuilder';
import { getMappingSourceByRef, getMappingTargetByRef } from '../helpers';
import { CLUSTER_API_VERSION, ProviderType } from '@app/common/constants';
import { nameAndNamespace } from '@app/queries/helpers';
import { filterSourcesBySelectedVMs } from '@app/Plans/components/Wizard/helpers';
import { IDisk, IMappingResourcesResult, INicProfile } from '@app/queries';
import { getObjectRef } from '@app/common/helpers';

export const getBuilderItemsFromMappingItems = (
  items: MappingItem[] | null,
  mappingType: MappingType,
  allSources: MappingSource[],
  allTargets: MappingTarget[]
): IMappingBuilderItem[] =>
  items
    ? (items
        .map((item: MappingItem): IMappingBuilderItem | null => {
          const source = getMappingSourceByRef(allSources, item.source);
          const target = getMappingTargetByRef(allTargets, item.destination, mappingType);
          if (source) {
            return { source, target };
          }
          return null;
        })
        .filter((builderItem) => !!builderItem) as IMappingBuilderItem[])
    : [];

export const getBuilderItemsFromMapping = (
  mapping: Mapping,
  mappingType: MappingType,
  allSources: MappingSource[],
  allTargets: MappingTarget[]
): IMappingBuilderItem[] =>
  getBuilderItemsFromMappingItems(
    mapping.spec.map as MappingItem[],
    mappingType,
    allSources,
    allTargets
  );

interface IGetMappingParams {
  mappingType: MappingType;
  mappingName: string | null;
  generateName: string | null;
  owner?: IPlan;
  sourceProvider: SourceInventoryProvider;
  targetProvider: IOpenShiftProvider;
  builderItems: IMappingBuilderItem[];
}

export const getMappingFromBuilderItems = ({
  mappingType,
  mappingName,
  generateName,
  owner,
  sourceProvider,
  targetProvider,
  builderItems,
}: IGetMappingParams): Mapping => {
  const items: MappingItem[] = builderItems
    .map((builderItem): MappingItem | null => {
      if (builderItem.source && builderItem.target) {
        if (mappingType === MappingType.Network) {
          const item: INetworkMappingItem = {
            source: { id: builderItem.source.id },
            destination:
              builderItem.target.selfLink === 'pod'
                ? { type: 'pod' }
                : {
                    name: builderItem.target.name,
                    namespace: builderItem.target.namespace,
                    type: 'multus',
                  },
          };
          return item;
        }
        if (mappingType === MappingType.Storage) {
          const item: IStorageMappingItem = {
            source: { id: builderItem.source.id },
            destination: {
              storageClass: builderItem.target.name,
            },
          };
          return item;
        }
      }
      return null;
    })
    .filter((item) => !!item) as MappingItem[];
  const commonMapping: ICommonMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: mappingType === MappingType.Network ? 'NetworkMap' : 'StorageMap',
    metadata: {
      ...(generateName
        ? { generateName }
        : mappingName
        ? { name: mappingName }
        : { generateName: '' }),
      namespace: sourceProvider.namespace,
      ...(owner
        ? {
            ownerReferences: [getObjectRef(owner)],
            annotations: {
              'forklift.konveyor.io/shared': 'false',
            },
          }
        : {
            annotations: {
              'forklift.konveyor.io/shared': generateName ? 'false' : 'true',
            },
          }),
    },
    spec: {
      provider: {
        source: nameAndNamespace(sourceProvider),
        destination: nameAndNamespace(targetProvider),
      },
    },
  };
  if (mappingType === MappingType.Network) {
    const mapping: INetworkMapping = {
      ...commonMapping,
      spec: {
        ...commonMapping.spec,
        map: items as INetworkMappingItem[],
      },
    };
    return mapping;
  }
  const mapping: IStorageMapping = {
    ...commonMapping,
    spec: {
      ...commonMapping.spec,
      map: items as IStorageMappingItem[],
    },
  };
  return mapping;
};

export const getBuilderItemsWithMissingSources = (
  builderItems: IMappingBuilderItem[],
  mappingResourceQueries: IMappingResourcesResult,
  selectedVMs: SourceVM[],
  mappingType: MappingType,
  sourceProviderType: ProviderType,
  keepNonRequiredSources: boolean,
  nicProfiles: INicProfile[],
  disks: IDisk[]
): IMappingBuilderItem[] => {
  const nonEmptyItems = builderItems.filter((item) => item.source && item.target);
  const requiredSources = filterSourcesBySelectedVMs(
    mappingResourceQueries.availableSources,
    selectedVMs,
    mappingType,
    sourceProviderType,
    nicProfiles,
    disks
  );
  const itemsToKeep = keepNonRequiredSources
    ? nonEmptyItems
    : nonEmptyItems.filter((item) =>
        requiredSources.some((source) => item.source?.selfLink === source.selfLink)
      );
  const missingSources = requiredSources.filter(
    (source) => !itemsToKeep.some((item) => item.source?.selfLink === source.selfLink)
  );
  return [
    ...itemsToKeep,
    ...missingSources.map(
      (source): IMappingBuilderItem => ({
        source,
        target: null,
      })
    ),
  ];
};
