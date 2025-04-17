import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const getName = (resource: K8sResourceCommon) => resource?.metadata?.name;

export const getNamespace = (resource: K8sResourceCommon) => resource?.metadata?.namespace;

export const getCreatedAt = (resource: K8sResourceCommon) => resource?.metadata?.creationTimestamp;
