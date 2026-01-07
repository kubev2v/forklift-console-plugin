import type { V1beta1NetworkMap, V1beta1NetworkMapSpecMap, V1beta1Provider } from '@kubev2v/types';
import type { Page } from '@playwright/test';

import { CreateProviderPage } from '../../page-objects/CreateProviderPage';
import { FORKLIFT_API_VERSION, MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import type { ResourceManager } from '../../utils/resource-manager/ResourceManager';

export type TestNetworkMap = V1beta1NetworkMap & {
  metadata: {
    name: string;
    namespace: string;
  };
};

export type NetworkMapMappingConfig = {
  sourceId?: string;
  sourceName: string;
  sourceType?: string;
  destinationType: 'pod' | 'multus';
  destinationName?: string;
  destinationNamespace?: string;
};

export const createNetworkMap = async (
  page: Page,
  resourceManager: ResourceManager,
  options: {
    sourceProvider: V1beta1Provider;
    targetProvider: V1beta1Provider;
    mappings: NetworkMapMappingConfig[];
    name?: string;
    namespace?: string;
  },
): Promise<TestNetworkMap> => {
  const { sourceProvider, targetProvider, mappings, name, namespace = MTV_NAMESPACE } = options;

  const sourceProviderName = sourceProvider.metadata?.name;
  const targetProviderName = targetProvider.metadata?.name;

  if (!sourceProviderName || !targetProviderName) {
    throw new Error('Source and target providers must have metadata.name defined');
  }

  const networkMapName = name ?? `${sourceProviderName}-netmap-${crypto.randomUUID().slice(0, 8)}`;

  const createProviderPage = new CreateProviderPage(page, resourceManager);
  await createProviderPage.navigationHelper.navigateToConsole();

  const specMappings: V1beta1NetworkMapSpecMap[] = mappings.map((mapping) => {
    const destination =
      mapping.destinationType === 'pod'
        ? { type: 'pod' as const, name: mapping.destinationName ?? 'Default network' }
        : {
            type: 'multus' as const,
            name: mapping.destinationName,
            namespace: mapping.destinationNamespace,
          };

    return {
      destination,
      source: { id: mapping.sourceId, name: mapping.sourceName, type: mapping.sourceType },
    };
  });

  const networkMap: V1beta1NetworkMap = {
    apiVersion: FORKLIFT_API_VERSION,
    kind: 'NetworkMap',
    metadata: { name: networkMapName, namespace },
    spec: {
      map: specMappings,
      provider: {
        destination: {
          name: targetProviderName,
          namespace: targetProvider.metadata?.namespace ?? namespace,
        },
        source: {
          name: sourceProviderName,
          namespace: sourceProvider.metadata?.namespace ?? namespace,
        },
      },
    },
  };

  const createdNetworkMap = await resourceManager.createNetworkMap(page, networkMap, namespace);
  if (!createdNetworkMap) {
    throw new Error(`Failed to create network map ${networkMapName}`);
  }

  resourceManager.addNetworkMap(networkMapName, namespace);

  return {
    ...createdNetworkMap,
    metadata: { ...createdNetworkMap.metadata, name: networkMapName, namespace },
  };
};

export const createSimpleNetworkMap = async (
  page: Page,
  resourceManager: ResourceManager,
  sourceProvider: V1beta1Provider,
  targetProvider: V1beta1Provider,
  sourceNetworks: { id?: string; name: string; type?: string }[],
): Promise<TestNetworkMap> => {
  const mappings: NetworkMapMappingConfig[] = sourceNetworks.map((network) => ({
    sourceId: network.id,
    sourceName: network.name,
    sourceType: network.type,
    destinationType: 'pod' as const,
  }));

  return createNetworkMap(page, resourceManager, { sourceProvider, targetProvider, mappings });
};
