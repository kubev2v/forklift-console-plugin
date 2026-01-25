import { StorageMapModel, type V1beta1StorageMap } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Creates a copy of an existing StorageMap with a plan-specific name
 */
export const copyStorageMap = async (
  existingMap: V1beta1StorageMap,
  planName: string,
  namespace: string,
): Promise<V1beta1StorageMap> => {
  const newName = `${planName}-${existingMap.metadata?.name}`;

  const newStorageMap: V1beta1StorageMap = {
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
    data: newStorageMap,
    model: StorageMapModel,
  });
};
