import type { V1beta1Provider } from '@kubev2v/types';

import { ProviderType } from './types';

export const hasWarmMigrationProviderType = (
  sourceProvider: V1beta1Provider | undefined,
): boolean => {
  const sourceProviderType = sourceProvider?.spec?.type;
  return sourceProviderType === ProviderType.Vsphere || sourceProviderType === ProviderType.Ovirt;
};
