import type {
  IoK8sApiCoreV1Secret,
  V1beta1NetworkMap,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@forklift-ui/types';

import { BaseResourceManager } from './BaseResourceManager';
import { API_PATHS, MTV_NAMESPACE } from './constants';

export type V1NetworkAttachmentDefinition = {
  apiVersion: 'k8s.cni.cncf.io/v1';
  kind: 'NetworkAttachmentDefinition';
  metadata: {
    name: string;
    namespace: string;
    annotations?: Record<string, string>;
  };
  spec: {
    config: string;
  };
};

export const createProvider = async (
  provider: V1beta1Provider,
  namespace = MTV_NAMESPACE,
): Promise<V1beta1Provider | null> => {
  const apiPath = `${API_PATHS.FORKLIFT}/namespaces/${namespace}/providers`;
  return BaseResourceManager.apiPost<V1beta1Provider>(apiPath, provider);
};

export const createSecret = async (
  secret: IoK8sApiCoreV1Secret,
  namespace = MTV_NAMESPACE,
): Promise<IoK8sApiCoreV1Secret | null> => {
  const apiPath = `${API_PATHS.KUBERNETES_CORE}/namespaces/${namespace}/secrets`;
  return BaseResourceManager.apiPost<IoK8sApiCoreV1Secret>(apiPath, secret);
};

export const createNad = async (
  nad: V1NetworkAttachmentDefinition,
  namespace: string,
): Promise<V1NetworkAttachmentDefinition | null> => {
  const apiPath = `${API_PATHS.NAD}/namespaces/${namespace}/network-attachment-definitions`;
  return BaseResourceManager.apiPost<V1NetworkAttachmentDefinition>(apiPath, nad);
};

export const createNetworkMap = async (
  networkMap: V1beta1NetworkMap,
  namespace = MTV_NAMESPACE,
): Promise<V1beta1NetworkMap | null> => {
  const apiPath = `${API_PATHS.FORKLIFT}/namespaces/${namespace}/networkmaps`;
  return BaseResourceManager.apiPost<V1beta1NetworkMap>(apiPath, networkMap);
};

export const createStorageMap = async (
  storageMap: V1beta1StorageMap,
  namespace = MTV_NAMESPACE,
): Promise<V1beta1StorageMap | null> => {
  const apiPath = `${API_PATHS.FORKLIFT}/namespaces/${namespace}/storagemaps`;
  return BaseResourceManager.apiPost<V1beta1StorageMap>(apiPath, storageMap);
};
