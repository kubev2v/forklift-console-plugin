import type { V1beta1Provider } from '@kubev2v/types';
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

export const getVddkInitImage = (provider: V1beta1Provider) =>
  provider?.spec?.settings?.vddkInitImage;

export const getUseVddkAioOptimization = (provider: V1beta1Provider) =>
  provider?.spec?.settings?.useVddkAioOptimization;

export const getSdkEndpoint = (provider: V1beta1Provider) => provider?.spec?.settings?.sdkEndpoint;

export const getSettings = (provider: V1beta1Provider) => provider?.spec?.settings;

export const getAnnotations = (provider: V1beta1Provider) => provider?.metadata?.annotations;

export const getUrl = (provider: V1beta1Provider) => provider?.spec?.url;

export const getType = (provider: V1beta1Provider | undefined) => provider?.spec?.type;
