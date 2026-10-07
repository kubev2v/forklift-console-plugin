import type {
  K8sResourceCondition,
  V1beta1Provider,
  V1beta1ProviderSpecSecret,
} from '@forklift-ui/types';
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

export const getCopyApplianceDatastore = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceDatastore;

export const getCopyApplianceFolder = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceFolder;

export const getCopyApplianceNetwork = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceNetwork;

export const getCopyApplianceResourcePool = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceResourcePool;

/** Provider status fields not yet in published @forklift-ui/types. */
type ProviderCopyApplianceTemplateStatus = {
  copyApplianceSSHPrivateSecret?: string;
  copyApplianceSSHPublicSecret?: string;
};

const getCopyApplianceTemplateStatus = (
  provider: V1beta1Provider,
): ProviderCopyApplianceTemplateStatus | undefined => {
  const status: unknown = provider?.status;
  if (typeof status !== 'object' || status === null) {
    return undefined;
  }
  const record = status as Record<string, unknown>;
  const copyApplianceSSHPrivateSecret =
    typeof record.copyApplianceSSHPrivateSecret === 'string'
      ? record.copyApplianceSSHPrivateSecret
      : undefined;
  const copyApplianceSSHPublicSecret =
    typeof record.copyApplianceSSHPublicSecret === 'string'
      ? record.copyApplianceSSHPublicSecret
      : undefined;
  return { copyApplianceSSHPrivateSecret, copyApplianceSSHPublicSecret };
};

export const getCopyApplianceSSHPrivateSecret = (provider: V1beta1Provider): string | undefined => {
  const fromStatus = getCopyApplianceTemplateStatus(provider)?.copyApplianceSSHPrivateSecret;
  if (fromStatus) {
    return fromStatus;
  }
  const name = getName(provider);
  return name ? `copy-appliance-ssh-keys-${name}-private` : undefined;
};

export const getCopyApplianceSSHPublicSecret = (provider: V1beta1Provider): string | undefined => {
  const fromStatus = getCopyApplianceTemplateStatus(provider)?.copyApplianceSSHPublicSecret;
  if (fromStatus) {
    return fromStatus;
  }
  const name = getName(provider);
  return name ? `copy-appliance-ssh-keys-${name}-public` : undefined;
};

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

export const getProviderConditions = (
  provider: V1beta1Provider | undefined,
): K8sResourceCondition[] | undefined => provider?.status?.conditions;
