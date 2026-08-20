import type { V1beta1Provider, V1beta1ProviderSpecSecret } from '@forklift-ui/types';
import type {
  K8sGroupVersionKind,
  K8sResourceCommon,
  OwnerReference,
} from '@openshift-console/dynamic-plugin-sdk';

export const getName = (resource: K8sResourceCommon | undefined): string | undefined =>
  resource?.metadata?.name;

export const getNamespace = (resource: K8sResourceCommon | undefined): string | undefined =>
  resource?.metadata?.namespace;

export const getCreatedAt = (resource: K8sResourceCommon): string | undefined =>
  resource?.metadata?.creationTimestamp;

export const getUID = (resource: K8sResourceCommon): string | undefined => resource?.metadata?.uid;

export const getLabels = (resource: K8sResourceCommon): Record<string, string> | undefined =>
  resource?.metadata?.labels;

export const getOwnerReference = (resource: K8sResourceCommon): OwnerReference | undefined =>
  resource?.metadata?.ownerReferences?.[0];

export const getGroupVersionKindFromOwnerReference = (
  ownerReference: OwnerReference,
): K8sGroupVersionKind => {
  const apiVersion = ownerReference.apiVersion ?? '';
  const [group, version] = apiVersion.includes('/')
    ? apiVersion.split('/')
    : [undefined, apiVersion];

  return {
    group,
    kind: ownerReference.kind,
    version,
  };
};

const getSettings = (provider: V1beta1Provider): Record<string, string> | undefined =>
  provider?.spec?.settings;

export const getVddkInitImage = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.vddkInitImage;

export const getUseVddkAioOptimization = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.useVddkAioOptimization;

export const getSdkEndpoint = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.sdkEndpoint;

export const getApplianceManagement = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.applianceManagement;

export const isApplianceManagementEnabled = (provider: V1beta1Provider): boolean =>
  getApplianceManagement(provider) === 'true';

export const getAnnotation = (resource: K8sResourceCommon, key: string): string | undefined =>
  resource?.metadata?.annotations?.[key];

export const getAnnotations = (
  resource: K8sResourceCommon | undefined,
): Record<string, string> | undefined => resource?.metadata?.annotations;

export const getUrl = (provider: V1beta1Provider): string | undefined => provider?.spec?.url;

export const getType = (provider: V1beta1Provider | undefined): string | undefined =>
  provider?.spec?.type;

export const getProviderSecretRef = (
  provider: V1beta1Provider,
): V1beta1ProviderSpecSecret | undefined => provider?.spec?.secret;
