import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@kubev2v/types';

/**
 * Determines if the source provider supports warm migration
 * Currently only vSphere and oVirt providers support warm migration
 */
export const hasWarmMigrationProviderType = (
  sourceProvider: V1beta1Provider | undefined,
): boolean => {
  const sourceProviderType = sourceProvider?.spec?.type;
  return (
    sourceProviderType === PROVIDER_TYPES.vsphere || sourceProviderType === PROVIDER_TYPES.ovirt
  );
};
