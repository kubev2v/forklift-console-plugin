import type { V1beta1Provider } from '@forklift-ui/types';
import { isAzureMockInventoryEnabled } from '@utils/mocks/azureInventory';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { ProviderStatus } from '@utils/types';

import { isPlatformRestrictedProvider } from './utils';

type ProviderVisibilityFlags = {
  isAwsPlatform: boolean;
  isAzurePlatform: boolean;
  isTarget?: boolean;
};

/**
 * Providers listed in a provider select. Azure providers are treated as ready
 * while the development inventory mock is enabled.
 */
export const isProviderVisible = (
  provider: V1beta1Provider,
  flags: ProviderVisibilityFlags,
): boolean => {
  const isReady = provider.status?.phase === ProviderStatus.Ready;
  const isMockedAzure =
    isAzureMockInventoryEnabled() && provider.spec?.type === PROVIDER_TYPES.azure;

  if (flags.isTarget) {
    return isReady && provider.spec?.type === PROVIDER_TYPES.openshift;
  }

  return (isReady || isMockedAzure) && !isPlatformRestrictedProvider(provider, flags);
};
