import { ProviderType, V1beta1Provider } from '@kubev2v/types';

/**
 * Checks if the provider is a target provider or not.
 *
 * @param {V1beta1Provider} provider - The provider to be checked.
 * @returns {boolean} - Returns true if the provider is a target provider, false otherwise.
 */
export function getIsTarget(provider: V1beta1Provider): boolean {
  return TARGET_PROVIDER_TYPES.includes(provider?.spec.type as ProviderType);
}

/**
 * Checks if the provider is only a source provider or not.
 *
 * @param {V1beta1Provider} provider - The provider to be checked.
 * @returns {boolean} - Returns true if the provider is a target provider, false otherwise.
 */
export function getIsOnlySource(provider: V1beta1Provider): boolean {
  return SOURCE_ONLY_PROVIDER_TYPES.includes(provider?.spec.type as ProviderType);
}

export const SOURCE_ONLY_PROVIDER_TYPES: ProviderType[] = ['ova', 'vsphere', 'ovirt', 'openstack'];
export const TARGET_PROVIDER_TYPES: ProviderType[] = ['openshift'];
