import {
  DefaultNetworkLabel,
  IgnoreNetwork,
} from 'src/plans/details/tabs/Mappings/utils/constants';
import { IGNORED, MULTUS, POD } from 'src/plans/details/utils/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import {
  NetworkMapModel,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
  type V1beta1NetworkMapSpecMapDestination,
  type V1beta1Provider,
} from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { getObjectRef } from '@utils/helpers/getObjectRef';

import type { NetworkMapping } from '../steps/network-map/constants';
import type { MappingValue } from '../types';

type CreateNetworkMapParams = {
  mappings: NetworkMapping[];
  project: string;
  sourceProvider?: V1beta1Provider;
  targetProvider?: V1beta1Provider;
  name?: string;
  targetNamespace: string;
  trackEvent?: (eventType: string, properties?: Record<string, unknown>) => void;
};

const getNetworkType = (targetName: string) => {
  if (targetName === DefaultNetworkLabel.Source || targetName === '') {
    return POD;
  }

  if (targetName === IgnoreNetwork.Label) {
    return IGNORED;
  }

  return MULTUS;
};

const getSource = (sourceNetwork: MappingValue, sourceProvider?: V1beta1Provider) => {
  if (sourceNetwork.id === POD) {
    return { type: POD };
  }
  return {
    id: sourceNetwork.id,
    name: sourceNetwork.name,
    // Set type to 'multus' only for OpenShift source providers
    type: sourceProvider?.spec?.type === PROVIDER_TYPES.openshift ? MULTUS : undefined,
  };
};

const getDestination = (
  targetNetwork: { name: string },
  targetNamespace: string,
): V1beta1NetworkMapSpecMapDestination => {
  const [nadNamespace, nadName] = targetNetwork.name.includes('/')
    ? targetNetwork.name.split('/')
    : [targetNamespace, targetNetwork.name];

  if (targetNetwork.name === DefaultNetworkLabel.Source || targetNetwork.name === '') {
    return { type: POD };
  }
  if (targetNetwork.name === IgnoreNetwork.Label) {
    return { type: IGNORED };
  }
  return {
    name: nadName,
    namespace: nadNamespace,
    type: MULTUS,
  };
};

/**
 * Creates a network map resource
 * Maps source networks to destination networks or pods based on configuration
 */
export const createNetworkMap = async ({
  mappings,
  name,
  project,
  sourceProvider,
  targetNamespace,
  targetProvider,
  trackEvent,
}: CreateNetworkMapParams) => {
  const sourceProviderName = sourceProvider?.metadata?.name;

  trackEvent?.('Network map create started', {
    mappingCount: mappings?.length,
    namespace: project,
    networkTypes: mappings?.map((mapping) => getNetworkType(mapping.targetNetwork.name)),
    sourceProviderType: sourceProvider?.spec?.type,
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
        map: mappings?.reduce(
          (acc: V1beta1NetworkMapSpecMap[], { sourceNetwork, targetNetwork }) => {
            if (sourceNetwork.name) {
              acc.push({
                destination: getDestination(targetNetwork, targetNamespace),
                source: getSource(sourceNetwork, sourceProvider),
              });
            }

            return acc;
          },
          [],
        ),
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
      networkTypes: mappings?.map((mapping) => getNetworkType(mapping.targetNetwork.name)),
      sourceProviderType: sourceProvider?.spec?.type,
    });

    return createdNetworkMap;
  } catch (error) {
    trackEvent?.('Network map create failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      mappingCount: mappings?.length,
      namespace: project,
      networkTypes: mappings?.map((mapping) => getNetworkType(mapping.targetNetwork.name)),
      sourceProviderType: sourceProvider?.spec?.type,
    });

    throw error;
  }
};
