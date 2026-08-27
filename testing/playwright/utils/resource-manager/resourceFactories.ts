import type {
  IoK8sApiCoreV1Namespace,
  IoK8sApiCoreV1Secret,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
  V1VirtualMachine,
} from '@forklift-ui/types';

import {
  FORKLIFT_API_VERSION,
  KUBEVIRT_API_VERSION,
  NAD_API_VERSION,
  NAMESPACE_API_VERSION,
  NAMESPACE_KIND,
  OPENSHIFT_PROJECT_API_VERSION,
  OPENSHIFT_PROJECT_KIND,
  RESOURCE_KINDS,
} from './constants';
import type { V1NetworkAttachmentDefinition } from './ResourceCreator';
import type { OpenshiftProject } from './types';

export const buildNad = (name: string, namespace: string): V1NetworkAttachmentDefinition => ({
  apiVersion: NAD_API_VERSION,
  kind: RESOURCE_KINDS.NETWORK_ATTACHMENT_DEFINITION,
  metadata: { name, namespace },
  spec: { config: '' },
});

export const buildNetworkMap = (name: string, namespace: string): V1beta1NetworkMap => ({
  apiVersion: FORKLIFT_API_VERSION,
  kind: RESOURCE_KINDS.NETWORK_MAP,
  metadata: { name, namespace },
});

export const buildPlan = (name: string, namespace: string): V1beta1Plan => ({
  apiVersion: FORKLIFT_API_VERSION,
  kind: RESOURCE_KINDS.PLAN,
  metadata: { name, namespace },
});

export const buildProject = (
  projectName: string,
  isOpenShift: boolean,
): IoK8sApiCoreV1Namespace | OpenshiftProject => {
  return isOpenShift
    ? {
        apiVersion: OPENSHIFT_PROJECT_API_VERSION,
        kind: OPENSHIFT_PROJECT_KIND,
        metadata: { name: projectName },
      }
    : {
        apiVersion: NAMESPACE_API_VERSION,
        kind: NAMESPACE_KIND,
        metadata: { name: projectName },
      };
};

export const buildProvider = (name: string, namespace: string): V1beta1Provider => ({
  apiVersion: FORKLIFT_API_VERSION,
  kind: RESOURCE_KINDS.PROVIDER,
  metadata: { name, namespace },
});

export const buildSecret = (name: string, namespace: string): IoK8sApiCoreV1Secret => ({
  apiVersion: 'v1',
  kind: 'Secret',
  metadata: { name, namespace },
});

export const buildStorageMap = (name: string, namespace: string): V1beta1StorageMap => ({
  apiVersion: FORKLIFT_API_VERSION,
  kind: RESOURCE_KINDS.STORAGE_MAP,
  metadata: { name, namespace },
});

export const buildVirtualMachine = (name: string, namespace: string): V1VirtualMachine => ({
  apiVersion: KUBEVIRT_API_VERSION,
  kind: RESOURCE_KINDS.VIRTUAL_MACHINE,
  metadata: { name, namespace },
  spec: { template: {} },
});
