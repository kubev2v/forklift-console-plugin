import type { V1beta1Provider } from '@forklift-ui/types';

import { getName } from '../common/selectors';

const getSettings = (provider: V1beta1Provider): Record<string, string> | undefined =>
  provider?.spec?.settings;

export const getCopyApplianceDatastore = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceDatastore;

export const getCopyApplianceFolder = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceFolder;

export const getCopyApplianceNetwork = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceNetwork;

export const getCopyApplianceResourcePool = (provider: V1beta1Provider): string | undefined =>
  getSettings(provider)?.copyApplianceResourcePool;

const getProviderStatusString = (provider: V1beta1Provider, key: string): string | undefined => {
  const status: unknown = provider?.status;
  if (typeof status !== 'object' || status === null) {
    return undefined;
  }
  const value = (status as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
};

export const getCopyApplianceSSHPrivateSecret = (provider: V1beta1Provider): string | undefined => {
  const fromStatus =
    getProviderStatusString(provider, 'copyApplianceSSHPrivateSecret') ??
    getProviderStatusString(provider, 'toeholdSSHPrivateSecret');
  if (fromStatus) {
    return fromStatus;
  }
  const name = getName(provider);
  return name ? `copy-appliance-ssh-keys-${name}-private` : undefined;
};

export const getCopyApplianceSSHPublicSecret = (provider: V1beta1Provider): string | undefined => {
  const fromStatus =
    getProviderStatusString(provider, 'copyApplianceSSHPublicSecret') ??
    getProviderStatusString(provider, 'toeholdSSHPublicSecret');
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
