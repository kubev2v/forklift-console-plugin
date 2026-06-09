import type { V1beta1Provider } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

/**
 * Determines if the source provider supports live migration.
 * Only OpenShift providers support live migration.
 */
export const hasLiveMigrationProviderType = (
  sourceProvider: V1beta1Provider | undefined,
): boolean => {
  const sourceProviderType = sourceProvider?.spec?.type;
  return sourceProviderType === PROVIDER_TYPES.openshift;
};
