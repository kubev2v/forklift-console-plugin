import type { V1beta1Provider } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

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
