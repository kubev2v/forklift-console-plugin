import { NetworkMapModel, type V1beta1NetworkMap } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Creates a copy of an existing NetworkMap with a plan-specific name
 */
export const copyNetworkMap = async (
  existingMap: V1beta1NetworkMap,
  planName: string,
  namespace: string,
): Promise<V1beta1NetworkMap> => {
  const newName = `${planName}-${existingMap.metadata?.name}`;

  const newNetworkMap: V1beta1NetworkMap = {
    apiVersion: existingMap.apiVersion,
    kind: existingMap.kind,
    metadata: {
      name: newName,
      namespace,
      // Copy relevant labels and annotations, but exclude system-managed fields
      ...(existingMap.metadata?.labels && { labels: existingMap.metadata.labels }),
      ...(existingMap.metadata?.annotations && { annotations: existingMap.metadata.annotations }),
    },
    spec: existingMap.spec,
  };

  return k8sCreate({
    data: newNetworkMap,
    model: NetworkMapModel,
  });
};
