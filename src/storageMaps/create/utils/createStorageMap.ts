import { getObjectRef } from 'src/modules/Providers/views/migrate/reducer/helpers';

import { StorageMapModel, type V1beta1Provider, type V1beta1StorageMap } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import type { StorageMapping } from '../fields/constants';

import { buildStorageMappings } from './buildStorageMappings';

type CreateStorageMapParams = {
  mappings: StorageMapping[];
  project: string;
  sourceProvider: V1beta1Provider | undefined;
  targetProvider: V1beta1Provider | undefined;
  name?: string;
};

/**
 * Creates a storage map resource for migration between providers
 *
 * This function creates a Kubernetes StorageMap resource that defines how source storage
 * should be mapped to destination storage classes during migration. It supports:
 * - Different provider types (OpenShift, vSphere, etc.)
 * - Special storage configurations (Glance storage)
 * - Optional copy offload plugins for performance optimization
 *
 * @param params - Configuration parameters for creating the storage map
 * @returns Promise that resolves to the created storage map resource
 */
export const createStorageMap = async ({
  mappings,
  name,
  project,
  sourceProvider,
  targetProvider,
}: CreateStorageMapParams) => {
  const sourceProviderName = sourceProvider?.metadata?.name;

  const storageMap: V1beta1StorageMap = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'StorageMap',
    metadata: {
      name,
      ...(!name && sourceProviderName && { generateName: `${sourceProvider?.metadata?.name}-` }),
      namespace: project,
    },
    spec: {
      map: buildStorageMappings(mappings, sourceProvider),
      provider: {
        destination: getObjectRef(targetProvider),
        source: getObjectRef(sourceProvider),
      },
    },
  };

  return k8sCreate({
    data: storageMap,
    model: StorageMapModel,
  });
};
