import type { V1beta1Provider } from '@kubev2v/types';

/**
 * Can this provider be considered a local openshift provider?
 */
export const isProviderLocalOpenshift = (provider: V1beta1Provider): boolean =>
  provider?.spec?.type === 'openshift' && (!provider?.spec?.url || provider?.spec?.url === '');

/**
 * Is this provider an openshift provider?
 */
export const isProviderOpenshift = (provider: V1beta1Provider): boolean =>
  provider?.spec?.type === 'openshift';
