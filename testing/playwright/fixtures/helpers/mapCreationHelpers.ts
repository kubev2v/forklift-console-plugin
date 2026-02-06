import type { V1beta1NetworkMap, V1beta1Provider, V1beta1StorageMap } from '@forklift-ui/types';
import type { Page } from '@playwright/test';

import type { Mapping } from '../../types/test-data';
import { NavigationHelper } from '../../utils/NavigationHelper';
import {
  FORKLIFT_API_VERSION,
  MTV_NAMESPACE,
  NAD_API_VERSION,
  RESOURCE_KINDS,
} from '../../utils/resource-manager/constants';
import {
  createNad as createNadApi,
  createNetworkMap as createNetworkMapApi,
  createStorageMap as createStorageMapApi,
  type V1NetworkAttachmentDefinition,
} from '../../utils/resource-manager/ResourceCreator';
import type { ResourceManager } from '../../utils/resource-manager/ResourceManager';

export const createTestNad = async (
  page: Page,
  resourceManager: ResourceManager,
  options: {
    name?: string;
    namespace: string;
    bridgeName?: string;
  },
): Promise<V1NetworkAttachmentDefinition> => {
  const { namespace, bridgeName = 'br0' } = options;
  const nadName = options.name ?? `nad-test-${crypto.randomUUID().slice(0, 8)}`;

  const navigationHelper = new NavigationHelper(page);
  await navigationHelper.navigateToConsole();

  const nadConfig = {
    cniVersion: '0.3.1',
    name: nadName,
    type: 'bridge',
    bridge: bridgeName,
    ipam: {},
  };

  const nad: V1NetworkAttachmentDefinition = {
    apiVersion: NAD_API_VERSION,
    kind: RESOURCE_KINDS.NETWORK_ATTACHMENT_DEFINITION,
    metadata: { name: nadName, namespace },
    spec: { config: JSON.stringify(nadConfig) },
  };

  const createdNad = await createNadApi(page, nad, namespace);
  if (!createdNad) {
    throw new Error(`Failed to create NAD ${nadName}`);
  }
  resourceManager.addNad(nadName, namespace);

  return {
    ...createdNad,
    metadata: { ...createdNad.metadata, name: nadName, namespace },
  };
};

// Network Map types and creation
export interface TestNetworkMap {
  name: string;
  namespace: string;
  sourceProvider: string;
  targetProvider: string;
  mappings: Mapping[];
}

export interface CreateNetworkMapOptions {
  sourceProvider: V1beta1Provider;
  targetProvider?: string;
  namePrefix?: string;
  mappings?: Mapping[];
}

export const createNetworkMap = async (
  page: Page,
  resourceManager: ResourceManager,
  options: CreateNetworkMapOptions,
): Promise<TestNetworkMap> => {
  const {
    sourceProvider,
    targetProvider = 'host',
    namePrefix = 'test-network-map',
    mappings = [],
  } = options;

  const name = `${namePrefix}-${crypto.randomUUID().slice(0, 8)}`;

  const navigationHelper = new NavigationHelper(page);
  await navigationHelper.navigateToConsole();

  // Create NetworkMap with empty map array - mappings should be added via UI
  // to ensure proper network ID resolution from provider inventory
  const networkMap: V1beta1NetworkMap = {
    apiVersion: FORKLIFT_API_VERSION,
    kind: RESOURCE_KINDS.NETWORK_MAP,
    metadata: { name, namespace: MTV_NAMESPACE },
    spec: {
      provider: {
        source: {
          name: sourceProvider.metadata!.name!,
          namespace: sourceProvider.metadata!.namespace!,
        },
        destination: { name: targetProvider, namespace: MTV_NAMESPACE },
      },
      map: [],
    },
  };

  const created = await createNetworkMapApi(page, networkMap, MTV_NAMESPACE);
  if (!created) {
    throw new Error(`Failed to create NetworkMap ${name}`);
  }
  resourceManager.addNetworkMap(name, MTV_NAMESPACE);

  return {
    name,
    namespace: MTV_NAMESPACE,
    sourceProvider: sourceProvider.metadata!.name!,
    targetProvider,
    mappings,
  };
};

// Storage Map types and creation
export interface TestStorageMap {
  name: string;
  namespace: string;
  sourceProvider: string;
  targetProvider: string;
  mappings: Mapping[];
}

export interface CreateStorageMapOptions {
  sourceProvider: V1beta1Provider;
  targetProvider?: string;
  namePrefix?: string;
  mappings?: Mapping[];
}

export const createStorageMap = async (
  page: Page,
  resourceManager: ResourceManager,
  options: CreateStorageMapOptions,
): Promise<TestStorageMap> => {
  const {
    sourceProvider,
    targetProvider = 'host',
    namePrefix = 'test-storage-map',
    mappings = [],
  } = options;

  const name = `${namePrefix}-${crypto.randomUUID().slice(0, 8)}`;

  const navigationHelper = new NavigationHelper(page);
  await navigationHelper.navigateToConsole();

  const storageMap: V1beta1StorageMap = {
    apiVersion: FORKLIFT_API_VERSION,
    kind: RESOURCE_KINDS.STORAGE_MAP,
    metadata: { name, namespace: MTV_NAMESPACE },
    spec: {
      provider: {
        source: {
          name: sourceProvider.metadata!.name!,
          namespace: sourceProvider.metadata!.namespace!,
        },
        destination: { name: targetProvider, namespace: MTV_NAMESPACE },
      },
      map: [],
    },
  };

  const created = await createStorageMapApi(page, storageMap, MTV_NAMESPACE);
  if (!created) {
    throw new Error(`Failed to create StorageMap ${name}`);
  }
  resourceManager.addStorageMap(name, MTV_NAMESPACE);

  return {
    name,
    namespace: MTV_NAMESPACE,
    sourceProvider: sourceProvider.metadata!.name!,
    targetProvider,
    mappings,
  };
};
