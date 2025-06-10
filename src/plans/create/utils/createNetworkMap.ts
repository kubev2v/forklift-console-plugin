import { getObjectRef } from 'src/modules/Providers/views/migrate/reducer/helpers';

import {
  NetworkMapModel,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
} from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import {
  defaultNetMapping,
  NetworkMapFieldId,
  type NetworkMapping,
} from '../steps/network-map/constants';
import { type CreateMapParams, ProviderType } from '../types';

/**
 * Creates a NetworkMap resource for VM migration
 * Maps source networks to destination networks or pods based on configuration
 */
export const createNetworkMap = async ({
  mappings,
  name,
  planProject,
  sourceProvider,
  targetProvider,
}: CreateMapParams<NetworkMapping>) => {
  const sourceProviderName = sourceProvider?.metadata?.name;
  const networkMap: V1beta1NetworkMap = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'NetworkMap',
    metadata: {
      name,
      ...(!name && sourceProviderName && { generateName: `${sourceProvider?.metadata?.name}-` }),
      namespace: planProject,
    },
    spec: {
      map: mappings?.reduce((acc: V1beta1NetworkMapSpecMap[], { sourceNetwork, targetNetwork }) => {
        if (sourceNetwork.name && targetNetwork.name) {
          acc.push({
            // Handle pod network type or multus network type for the destination
            destination:
              targetNetwork.name === defaultNetMapping[NetworkMapFieldId.TargetNetwork].name
                ? { type: 'pod' }
                : {
                    name: targetNetwork.name.includes('/')
                      ? targetNetwork.name.split('/')[1]
                      : targetNetwork.name,
                    namespace: planProject,
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
                      sourceProvider?.spec?.type === ProviderType.Openshift ? 'multus' : undefined,
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
