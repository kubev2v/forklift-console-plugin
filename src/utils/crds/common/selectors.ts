import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const getName = (resource: K8sResourceCommon | undefined) => resource?.metadata?.name;

export const getNamespace = (resource: K8sResourceCommon | undefined) =>
  resource?.metadata?.namespace;

export const getCreatedAt = (resource: K8sResourceCommon) => resource?.metadata?.creationTimestamp;

export const getUID = (resource: K8sResourceCommon) => resource?.metadata?.uid;

export const getOwnerReference = (resource: K8sResourceCommon) =>
  resource?.metadata?.ownerReferences?.[0];

export const getKind = (resource: K8sResourceCommon) => resource?.kind;

export const getApiVersion = (resource: K8sResourceCommon) => resource?.apiVersion;
