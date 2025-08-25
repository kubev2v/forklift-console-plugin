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

type getMappingAlertsProps = {
  targetStoragesEmpty: boolean;
  sourceStoragesEmpty: boolean;
  sourceNetworkEmpty: boolean;
  resourcesError: Error | undefined;
};

export const getMappingAlerts: (props: getMappingAlertsProps) => string[] = ({
  resourcesError,
  sourceNetworkEmpty,
  sourceStoragesEmpty,
  targetStoragesEmpty,
}) => {
  // Warn when missing inventory data, missing inventory will make
  // some editing options missing.
  const alerts = [];

  if (targetStoragesEmpty) {
    // Note: target network can't be missing, we always have Default network.
    alerts.push(
      t(
        'The target storage mapping data from the inventory is not available: {{resourcesError}}.',
        {
          resourcesError: resourcesError?.message,
        },
      ),
    );
  }

  if (sourceStoragesEmpty || sourceNetworkEmpty) {
    alerts.push(
      t('The source mapping data from the inventory is not available: {{resourcesError}}.', {
        resourcesError: resourcesError?.message,
      }),
    );
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

  if (networkMapsEmpty || storageMapsEmpty) {
    return t('The mapping data from the inventory is not available, {{resourcesError}}.', {
      resourcesError: resourcesError?.message,
    });
  }

  return null;
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
  planNetworkMap: V1beta1NetworkMap;
  planStorageMap: V1beta1StorageMap;
  updatedNetwork: V1beta1NetworkMapSpecMap[];
  updatedStorage: V1beta1StorageMapSpecMap[];
};

export const patchPlanMappingsData = async ({
  planNetworkMap,
  planStorageMap,
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
    resource: planNetworkMap,
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
    resource: planStorageMap,
  });
};
