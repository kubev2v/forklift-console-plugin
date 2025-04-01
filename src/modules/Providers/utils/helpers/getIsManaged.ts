import { V1beta1Provider } from '@kubev2v/types';

/**
 * Checks if the provider is managed or not.
 *
 * @param {V1beta1Provider} provider - The provider to be checked.
 * @returns {boolean} - Returns true if the provider is managed, false otherwise.
 */
export function getIsManaged(provider: V1beta1Provider): boolean {
  const ownerReferences = provider?.metadata?.ownerReferences || [];
  return ownerReferences.length > 0;
}
