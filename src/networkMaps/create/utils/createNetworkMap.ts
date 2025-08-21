import { getObjectRef } from 'src/modules/Providers/views/migrate/reducer/helpers';

import { NetworkMapModel, type V1beta1NetworkMap, type V1beta1Provider } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import type { NetworkMapping } from '../../constants';

import { buildNetworkMappings } from './buildNetworkMappings';

type CreateNetworkMapParams = {
  mappings: NetworkMapping[];
  project: string;
  sourceProvider: V1beta1Provider | undefined;
  targetProvider: V1beta1Provider | undefined;
  name?: string;
  trackEvent?: (eventType: string, properties?: Record<string, unknown>) => void;
};

/**
 * Creates a network map resource for migration between providers
 *
 * This function creates a Kubernetes NetworkMap resource that defines how source networks
 * should be mapped to destination networks during migration. It supports:
 * - Different provider types (OpenShift, vSphere, etc.)
 * - Pod networking for OpenShift targets
 * - Named and ID-based network mapping
 *
 * @param params - Configuration parameters for creating the network map
 * @returns Promise that resolves to the created network map resource
 */
export const createNetworkMap = async ({
  mappings,
  name,
  project,
  sourceProvider,
  targetProvider,
  trackEvent,
}: CreateNetworkMapParams) => {
  const sourceProviderName = sourceProvider?.metadata?.name;

  trackEvent?.('Network map create started', {
    mappingCount: mappings?.length,
    namespace: project,
    sourceProviderType: sourceProvider?.spec?.type,
    targetNetworks: mappings?.map((mapping) => mapping.targetNetwork?.name).filter(Boolean),
  });

  try {
    const networkMap: V1beta1NetworkMap = {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'NetworkMap',
      metadata: {
        name,
        ...(!name && sourceProviderName && { generateName: `${sourceProvider?.metadata?.name}-` }),
        namespace: project,
      },
      spec: {
        map: buildNetworkMappings(mappings, sourceProvider),
        provider: {
          destination: getObjectRef(targetProvider),
          source: getObjectRef(sourceProvider),
        },
      },
    };

    const createdNetworkMap = await k8sCreate({
      data: networkMap,
      model: NetworkMapModel,
    });

    trackEvent?.('Network map created', {
      mappingCount: mappings?.length,
      namespace: project,
      networkMapName: createdNetworkMap.metadata?.name,
      sourceProviderType: sourceProvider?.spec?.type,
      targetNetworks: mappings?.map((mapping) => mapping.targetNetwork?.name).filter(Boolean),
    });

    return createdNetworkMap;
  } catch (error) {
    trackEvent?.('Network map create failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      mappingCount: mappings?.length,
      namespace: project,
      sourceProviderType: sourceProvider?.spec?.type,
      targetNetworks: mappings?.map((mapping) => mapping.targetNetwork?.name).filter(Boolean),
    });

    throw error;
  }
};
