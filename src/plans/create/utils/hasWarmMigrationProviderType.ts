import type { V1beta1Provider } from '@kubev2v/types';

import { ProviderType } from '../types';

/**
 * Determines if the source provider supports warm migration
 * Currently only vSphere and oVirt providers support warm migration
 */
export const hasWarmMigrationProviderType = (
  sourceProvider: V1beta1Provider | undefined,
): boolean => {
  const sourceProviderType = sourceProvider?.spec?.type;
  return sourceProviderType === ProviderType.Vsphere || sourceProviderType === ProviderType.Ovirt;
};
