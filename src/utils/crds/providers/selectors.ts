import type { V1beta1Provider, V1beta1ProviderStatus } from '@forklift-ui/types';

import { getName } from '../common/selectors';

type ProviderStatusWithCopyApplianceSSH = V1beta1ProviderStatus & {
  copyApplianceSSHPrivateSecret?: string;
  copyApplianceSSHPublicSecret?: string;
};

const getSettings = (provider: V1beta1Provider): Record<string, string> | undefined =>
  provider?.spec?.settings;

const getProviderStatus = (
  provider: V1beta1Provider,
): ProviderStatusWithCopyApplianceSSH | undefined => provider?.status;

export const getCopyApplianceDatastore = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceDatastore;

export const getCopyApplianceFolder = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceFolder;

export const getCopyApplianceNetwork = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceNetwork;

export const getCopyApplianceResourcePool = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceResourcePool;

export const getCopyApplianceSSHPrivateSecret = (provider: V1beta1Provider): string | undefined => {
  const fromStatus = getProviderStatus(provider)?.copyApplianceSSHPrivateSecret;
  if (fromStatus) {
    return fromStatus;
  }
  const name = getName(provider);
  return name ? `copy-appliance-ssh-keys-${name}-private` : undefined;
};

export const getCopyApplianceSSHPublicSecret = (provider: V1beta1Provider): string | undefined => {
  const fromStatus = getProviderStatus(provider)?.copyApplianceSSHPublicSecret;
  if (fromStatus) {
    return fromStatus;
  }
  const name = getName(provider);
  return name ? `copy-appliance-ssh-keys-${name}-public` : undefined;
};

export const getCopyApplianceTemplateName = (
  provider: V1beta1Provider | undefined,
): string | undefined => {
  const name = getName(provider);
  return name ? `${name}-copy-appliance-template` : undefined;
};
