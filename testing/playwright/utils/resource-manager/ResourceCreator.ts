import type { IoK8sApiCoreV1Secret, V1beta1NetworkMap, V1beta1Provider } from '@forklift-ui/types';
import type { Page } from '@playwright/test';

import { BaseResourceManager } from './BaseResourceManager';
import { API_PATHS, MTV_NAMESPACE } from './constants';

/**
 * NetworkAttachmentDefinition type for CNI network configuration
 */
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
  page: Page,
  provider: V1beta1Provider,
  namespace = MTV_NAMESPACE,
): Promise<V1beta1Provider | null> => {
  const apiPath = `${API_PATHS.FORKLIFT}/namespaces/${namespace}/providers`;
  return BaseResourceManager.apiPost<V1beta1Provider>(page, apiPath, provider);
};

export const createSecret = async (
  page: Page,
  secret: IoK8sApiCoreV1Secret,
  namespace = MTV_NAMESPACE,
): Promise<IoK8sApiCoreV1Secret | null> => {
  const apiPath = `${API_PATHS.KUBERNETES_CORE}/namespaces/${namespace}/secrets`;
  return BaseResourceManager.apiPost<IoK8sApiCoreV1Secret>(page, apiPath, secret);
};

export const createNad = async (
  page: Page,
  nad: V1NetworkAttachmentDefinition,
  namespace: string,
): Promise<V1NetworkAttachmentDefinition | null> => {
  const apiPath = `${API_PATHS.NAD}/namespaces/${namespace}/network-attachment-definitions`;
  return BaseResourceManager.apiPost<V1NetworkAttachmentDefinition>(page, apiPath, nad);
};

export const createNetworkMap = async (
  page: Page,
  networkMap: V1beta1NetworkMap,
  namespace = MTV_NAMESPACE,
): Promise<V1beta1NetworkMap | null> => {
  const apiPath = `${API_PATHS.FORKLIFT}/namespaces/${namespace}/networkmaps`;
  return BaseResourceManager.apiPost<V1beta1NetworkMap>(page, apiPath, networkMap);
};
