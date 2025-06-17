import { getObjectRef } from 'src/modules/Providers/views/migrate/reducer/helpers';
import { PodNetworkLabel } from 'src/plans/details/tabs/Mappings/utils/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import {
  NetworkMapModel,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
  type V1beta1Provider,
} from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import type { NetworkMapping } from '../steps/network-map/constants';

type CreateNetworkMapParams = {
  mappings: NetworkMapping[];
  project: string;
  sourceProvider: V1beta1Provider | undefined;
  targetProvider: V1beta1Provider | undefined;
  name?: string;
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
            // Handle pod network type or multus network type for the destination
            destination:
              targetNetwork.name === PodNetworkLabel.Source || targetNetwork.name === ''
                ? { type: 'pod' }
                : {
                    name: targetNetwork.name.includes('/')
                      ? targetNetwork.name.split('/')[1]
                      : targetNetwork.name,
                    namespace: project,
                    type: 'multus',
                  },
            // Handle pod network type or regular network for the source
            source:
              sourceNetwork.id === 'pod'
                ? { type: 'pod' }
                : {
                    id: sourceNetwork.id,
                    name: sourceNetwork.name,
                    // Set type to 'multus' only for OpenShift source providers
                    type:
                      sourceProvider?.spec?.type === PROVIDER_TYPES.openshift
                        ? 'multus'
                        : undefined,
                  },
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
