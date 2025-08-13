import type { V1beta1Provider } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';

/**
 * Checks if the provider is managed or not.
 *
 * @param {V1beta1Provider} provider - The provider to be checked.
 * @returns {boolean} - Returns true if the provider is managed, false otherwise.
 */
export const getIsManaged = (provider: V1beta1Provider): boolean =>
  !isEmpty(provider?.metadata?.ownerReferences);
