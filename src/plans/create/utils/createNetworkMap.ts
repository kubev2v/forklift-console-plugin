import { getObjectRef } from 'src/modules/Providers/views/migrate/reducer/helpers';
import { IgnoreNetwork, PodNetworkLabel } from 'src/plans/details/tabs/Mappings/utils/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import {
  NetworkMapModel,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
  type V1beta1NetworkMapSpecMapDestination,
  type V1beta1Provider,
} from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import type { NetworkMapping } from '../steps/network-map/constants';
import type { MappingValue } from '../types';

type CreateNetworkMapParams = {
  mappings: NetworkMapping[];
  project: string;
  sourceProvider?: V1beta1Provider;
  targetProvider?: V1beta1Provider;
  name?: string;
  targetNamespace: string;
};

const getSource = (sourceNetwork: MappingValue, sourceProvider?: V1beta1Provider) => {
  if (sourceNetwork.id === 'pod') {
    return { type: 'pod' };
  }
  return {
    id: sourceNetwork.id,
    name: sourceNetwork.name,
    // Set type to 'multus' only for OpenShift source providers
    type: sourceProvider?.spec?.type === PROVIDER_TYPES.openshift ? 'multus' : undefined,
  };
};

const getDestination = (
  targetNetwork: { name: string },
  targetNamespace: string,
): V1beta1NetworkMapSpecMapDestination => {
  const [nadNamespace, nadName] = targetNetwork.name.includes('/')
    ? targetNetwork.name.split('/')
    : [targetNamespace, targetNetwork.name];

  if (targetNetwork.name === PodNetworkLabel.Source || targetNetwork.name === '') {
    return { type: 'pod' };
  }
  if (targetNetwork.name === IgnoreNetwork.Label) {
    return { type: IgnoreNetwork.Type };
  }
  return {
    name: nadName,
    namespace: nadNamespace,
    type: 'multus',
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
}: CreateNetworkMapParams) => {
  const sourceProviderName = sourceProvider?.metadata?.name;

  const networkMap: V1beta1NetworkMap = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'NetworkMap',
    metadata: {
      name,
      ...(!name && sourceProviderName && { generateName: `${sourceProvider?.metadata?.name}-` }),
      namespace: project,
    },
    spec: {
      map: mappings?.reduce((acc: V1beta1NetworkMapSpecMap[], { sourceNetwork, targetNetwork }) => {
        if (sourceNetwork.name) {
          acc.push({
            destination: getDestination(targetNetwork, targetNamespace),
            source: getSource(sourceNetwork, sourceProvider),
          });
        }

        return acc;
      }, []),
      provider: {
        destination: getObjectRef(targetProvider),
        source: getObjectRef(sourceProvider),
      },
    },
  };

  return k8sCreate({
    data: networkMap,
    model: NetworkMapModel,
  });
};
