import * as React from 'react';
import { isSameResource } from 'legacy/src/queries/helpers';
import {
  IdOrNameRef,
  IMetaObjectMeta,
  INetworkMappingItem,
  IOpenShiftProvider,
  IProvidersByType,
  IStorageMappingItem,
  Mapping,
  MappingItem,
  MappingSource,
  MappingTarget,
  MappingType,
  SourceInventoryProvider,
} from 'legacy/src/queries/types';
import { MappingFormState } from './AddEditMappingModal';
import { UseQueryResult } from 'react-query';
import { IMappingResourcesResult } from 'legacy/src/queries';
import { getBuilderItemsFromMapping } from './MappingBuilder/helpers';
import { ProviderType } from 'legacy/src/common/constants';
import { getStorageTitle } from 'legacy/src/common/helpers';

export const getMappingSourceByRef = (
  sources: MappingSource[],
  ref: IdOrNameRef
): MappingSource | null =>
  sources.find((source) => (ref.id ? source.id === ref.id : source.name === ref.name)) || null;

export const getMappingTargetByRef = (
  targets: MappingTarget[],
  ref: INetworkMappingItem['destination'] | IStorageMappingItem['destination'],
  mappingType: MappingType
): MappingTarget | null =>
  targets.find((target) => {
    if (mappingType === MappingType.Network) {
      const networkRef = ref as INetworkMappingItem['destination'];
      if (networkRef.type === 'pod') {
        return target.selfLink === 'pod';
      }
      return isSameResource(target, networkRef);
    }
    if (mappingType === MappingType.Storage) {
      const storageRef = ref as IStorageMappingItem['destination'];
      return target.name === storageRef.storageClass;
    }
    return null;
  }) || null;

export const getMappingSourceTitle = (
  mappingType: MappingType,
  providerType: ProviderType
): string => {
  if (mappingType === MappingType.Network) {
    return 'Source networks';
  }
  if (mappingType === MappingType.Storage) {
    return `Source ${getStorageTitle(providerType)}`;
  }
  return '';
};

export const getMappingTargetTitle = (mappingType: MappingType): string => {
  if (mappingType === MappingType.Network) {
    return 'Target namespaces / networks';
  }
  if (mappingType === MappingType.Storage) {
    return 'Target storage classes';
  }
  return '';
};

export const useEditingMappingPrefillEffect = (
  form: MappingFormState,
  mappingBeingEdited: Mapping | null,
  mappingType: MappingType,
  mappingBeingEditedProviders: {
    sourceProvider: SourceInventoryProvider | null;
    targetProvider: IOpenShiftProvider | null;
  },
  providersQuery: UseQueryResult<IProvidersByType>,
  mappingResourceQueries: IMappingResourcesResult
): { isDonePrefilling: boolean } => {
  const [isStartedPrefilling, setIsStartedPrefilling] = React.useState(false);
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(!mappingBeingEdited);
  React.useEffect(() => {
    if (
      !isStartedPrefilling &&
      mappingBeingEdited &&
      providersQuery.isSuccess &&
      mappingResourceQueries.status === 'success'
    ) {
      setIsStartedPrefilling(true);
      const { sourceProvider, targetProvider } = mappingBeingEditedProviders;
      const { availableSources, availableTargets } = mappingResourceQueries;

      form.fields.name.prefill((mappingBeingEdited.metadata as IMetaObjectMeta).name);
      form.fields.sourceProvider.prefill(sourceProvider);
      form.fields.targetProvider.prefill(targetProvider);

      form.fields.builderItems.prefill(
        getBuilderItemsFromMapping(
          mappingBeingEdited,
          mappingType,
          availableSources,
          availableTargets
        )
      );

      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [
    isStartedPrefilling,
    form.fields,
    mappingBeingEdited,
    mappingBeingEditedProviders,
    mappingResourceQueries,
    mappingType,
    providersQuery.isSuccess,
  ]);
  return { isDonePrefilling };
};

export const doesSourceExist = (availableSources: MappingSource[], mappingItem: MappingItem) =>
  !!getMappingSourceByRef(availableSources, mappingItem.source);

export const doesTargetExist = (
  mappingType: MappingType,
  availableTargets: MappingTarget[],
  mappingItem: MappingItem
): boolean =>
  availableTargets.some((target) => {
    if (mappingType === MappingType.Storage) {
      return target.name === (mappingItem as IStorageMappingItem).destination.storageClass;
    }
    if (mappingType === MappingType.Network) {
      const item = mappingItem as INetworkMappingItem;
      return item.destination.type === 'pod' || isSameResource(target, item.destination);
    }
    return false;
  });

export const isMappingValid = (
  mappingType: MappingType,
  mapping: Mapping,
  availableSources: MappingSource[],
  availableTargets: MappingTarget[]
): boolean =>
  (mapping.spec.map as MappingItem[]).every(
    (mappingItem) =>
      doesSourceExist(availableSources, mappingItem) &&
      doesTargetExist(mappingType, availableTargets, mappingItem)
  );
