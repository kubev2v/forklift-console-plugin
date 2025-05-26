import {
  NetworkMapModel,
  StorageMapModel,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
  type V1beta1StorageMap,
  type V1beta1StorageMapSpecMap,
} from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { t } from '@utils/i18n';

export const getMappingAlerts = (
  targetStoragesEmpty: boolean,
  sourceStoragesEmpty: boolean,
  sourceNetworkEmpty: boolean,
) => {
  // Warn when missing inventory data, missing inventory will make
  // some editing options missing.
  const alerts = [];

  if (targetStoragesEmpty) {
    // Note: target network can't be missing, we always have Pod network.
    alerts.push(t('Missing target storage inventory.'));
  }

  if (sourceStoragesEmpty || sourceNetworkEmpty) {
    alerts.push(t('Missing storage inventory.'));
  }

  return alerts;
};

type MappingPageMessageProps = {
  loadingResources: boolean;
  resourcesError: Error | undefined;
  networkMapsEmpty: boolean;
  storageMapsEmpty: boolean;
};

export const getMappingPageMessage: (props: MappingPageMessageProps) => string | null = ({
  loadingResources,
  networkMapsEmpty,
  resourcesError,
  storageMapsEmpty,
}) => {
  if (loadingResources) {
    return t('Data is loading, please wait.');
  }

  if (resourcesError) {
    return t('Something is wrong, {{resourcesError}}.', { resourcesError: resourcesError.message });
  }

  if (networkMapsEmpty || storageMapsEmpty) {
    return t('No Mapping found.');
  }

  return null;
};

type HasPlanMappingsChangedParams = {
  originalNetwork?: V1beta1NetworkMapSpecMap[];
  originalStorage?: V1beta1StorageMapSpecMap[];
  updatedNetwork?: V1beta1NetworkMapSpecMap[];
  updatedStorage?: V1beta1StorageMapSpecMap[];
};

export const hasPlanMappingsChanged = ({
  originalNetwork = [],
  originalStorage = [],
  updatedNetwork = [],
  updatedStorage = [],
}: HasPlanMappingsChangedParams): boolean => {
  const normalizeNetwork = (mappings: V1beta1NetworkMapSpecMap[]) =>
    mappings.map((mapping) => ({
      destinationName: mapping.destination?.name,
      destinationNamespace: mapping.destination?.namespace,
      destinationType: mapping.destination?.type,
      sourceId: mapping.source?.id ?? mapping.source?.type,
      sourceType: mapping.source?.type,
    }));

  const normalizeStorage = (mappings: V1beta1StorageMapSpecMap[]) =>
    mappings.map((mapping) => ({
      destinationStorageClass: mapping.destination?.storageClass,
      sourceId: mapping.source?.id,
      sourceType: mapping.source?.type,
    }));

  const originalNetworkNorm = normalizeNetwork(originalNetwork);
  const updatedNetworkNorm = normalizeNetwork(updatedNetwork);

  const originalStorageNorm = normalizeStorage(originalStorage);
  const updatedStorageNorm = normalizeStorage(updatedStorage);

  const changed =
    JSON.stringify(originalNetworkNorm) !== JSON.stringify(updatedNetworkNorm) ||
    JSON.stringify(originalStorageNorm) !== JSON.stringify(updatedStorageNorm);

  return changed;
};

const updateNetworkMapSpecMapDestination = (
  networkMaps: V1beta1NetworkMapSpecMap[],
): V1beta1NetworkMapSpecMap[] => {
  networkMaps?.forEach((entry) => {
    const [namespace, name] = entry?.destination?.name?.split('/') ?? [];
    if (namespace && name) {
      entry.destination.namespace = namespace;
      entry.destination.name = name;
    }
  });
  return networkMaps;
};

type UpdatePlanMappingsDataParams = {
  planNetworkMaps: V1beta1NetworkMap;
  planStorageMaps: V1beta1StorageMap;
  updatedNetwork: V1beta1NetworkMapSpecMap[];
  updatedStorage: V1beta1StorageMapSpecMap[];
};

export const patchPlanMappingsData = async ({
  planNetworkMaps,
  planStorageMaps,
  updatedNetwork,
  updatedStorage,
}: UpdatePlanMappingsDataParams) => {
  await k8sPatch({
    data: [
      {
        op: 'replace',
        path: '/spec/map',
        value: updateNetworkMapSpecMapDestination(updatedNetwork),
      },
    ],
    model: NetworkMapModel,
    resource: planNetworkMaps,
  });

  await k8sPatch({
    data: [
      {
        op: 'replace',
        path: '/spec/map',
        value: updatedStorage,
      },
    ],
    model: StorageMapModel,
    resource: planStorageMaps,
  });
};
