import type { V1beta1NetworkMap, V1beta1Provider } from '@forklift-ui/types';
import type { Page } from '@playwright/test';

import type { Mapping, NetworkMap } from '../../types/test-data';
import { NavigationHelper } from '../../utils/NavigationHelper';
import {
  FORKLIFT_API_VERSION,
  MTV_NAMESPACE,
  RESOURCE_KINDS,
} from '../../utils/resource-manager/constants';
import { createNetworkMap as createNetworkMapApi } from '../../utils/resource-manager/ResourceCreator';
import type { ResourceManager } from '../../utils/resource-manager/ResourceManager';

export interface NetworkMapTestData extends NetworkMap {
  name: string;
  sourceProvider: string;
  targetProvider: string;
  mappings: Mapping[];
}

export type TestNetworkMap = V1beta1NetworkMap & {
  metadata: {
    name: string;
    namespace: string;
  };
  testData: NetworkMapTestData;
};

export interface CreateNetworkMapOptions {
  sourceProvider: V1beta1Provider;
  targetProvider?: string;
  namePrefix?: string;
  customName?: string;
  mappings?: Mapping[];
}

const generateNetworkMapName = (namePrefix: string, customName?: string): string =>
  customName ?? `${namePrefix}-${crypto.randomUUID().slice(0, 8)}`;

const buildNetworkMapSpec = (
  sourceProvider: V1beta1Provider,
  targetProvider: string,
  mappings: Mapping[],
): V1beta1NetworkMap['spec'] => ({
  provider: {
    source: {
      name: sourceProvider.metadata!.name!,
      namespace: sourceProvider.metadata!.namespace!,
    },
    destination: {
      name: targetProvider,
      namespace: MTV_NAMESPACE,
    },
  },
  map: mappings.map((mapping) => ({
    source: {
      id: mapping.source,
    },
    destination: {
      type: mapping.target === 'pod' ? 'pod' : 'multus',
      ...(mapping.target !== 'pod' && {
        name: mapping.target,
        namespace: MTV_NAMESPACE,
      }),
    },
  })),
});

const buildTestNetworkMapResult = (name: string, testData: NetworkMapTestData): TestNetworkMap => ({
  apiVersion: FORKLIFT_API_VERSION,
  kind: RESOURCE_KINDS.NETWORK_MAP,
  metadata: {
    name,
    namespace: MTV_NAMESPACE,
  },
  testData,
});

export const createNetworkMap = async (
  page: Page,
  resourceManager: ResourceManager,
  options: CreateNetworkMapOptions,
): Promise<TestNetworkMap> => {
  const {
    sourceProvider,
    targetProvider = 'host',
    namePrefix = 'test-network-map',
    customName,
    mappings = [{ source: 'VM Network', target: 'pod' }],
  } = options;

  const networkMapName = generateNetworkMapName(namePrefix, customName);

  const navigationHelper = new NavigationHelper(page);
  await navigationHelper.navigateToConsole();

  const networkMapObject: V1beta1NetworkMap = {
    apiVersion: FORKLIFT_API_VERSION,
    kind: RESOURCE_KINDS.NETWORK_MAP,
    metadata: {
      name: networkMapName,
      namespace: MTV_NAMESPACE,
    },
    spec: buildNetworkMapSpec(sourceProvider, targetProvider, mappings),
  };

  const createdNetworkMap = await createNetworkMapApi(page, networkMapObject, MTV_NAMESPACE);
  if (!createdNetworkMap) {
    throw new Error(`Failed to create NetworkMap ${networkMapName}`);
  }
  resourceManager.addNetworkMap(networkMapName, MTV_NAMESPACE);

  const testData: NetworkMapTestData = {
    name: networkMapName,
    sourceProvider: sourceProvider.metadata!.name!,
    targetProvider,
    mappings,
  };

  return buildTestNetworkMapResult(networkMapName, testData);
};
