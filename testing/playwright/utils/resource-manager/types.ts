import type {
  IoK8sApiCoreV1Namespace,
  IoK8sApiCoreV1Secret,
  V1beta1ForkliftController,
  V1beta1Migration,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
  V1VirtualMachine,
} from '@forklift-ui/types';

import type { V1NetworkAttachmentDefinition } from './ResourceCreator';

export type OpenshiftProject = IoK8sApiCoreV1Namespace & {
  apiVersion: 'project.openshift.io/v1';
  kind: 'Project';
};

export type SupportedResource =
  | V1beta1ForkliftController
  | V1beta1Migration
  | V1beta1NetworkMap
  | V1beta1Plan
  | V1beta1Provider
  | V1beta1StorageMap
  | V1VirtualMachine
  | V1NetworkAttachmentDefinition
  | IoK8sApiCoreV1Namespace
  | IoK8sApiCoreV1Secret
  | OpenshiftProject;
