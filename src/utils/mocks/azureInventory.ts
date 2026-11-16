import type { V1beta1Provider } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import {
  AZURE_MOCK_NETWORKS,
  AZURE_MOCK_PROVIDER_INVENTORY,
  AZURE_MOCK_STORAGES,
  AZURE_MOCK_VMS,
} from './azureInventory.fixtures';

export const isAzureMockInventoryEnabled = (): boolean =>
  process.env.AZURE_MOCK_INVENTORY === 'true';

/**
 * Returns fixture inventory for Azure providers when AZURE_MOCK_INVENTORY=true.
 * Returns undefined for other providers, when the mock is disabled, or for an
 * unknown inventory sub path, so the regular inventory request runs.
 */
export const getAzureMockInventory = (
  provider: V1beta1Provider | undefined,
  subPath: string,
): object | undefined => {
  if (!isAzureMockInventoryEnabled() || provider?.spec?.type !== PROVIDER_TYPES.azure) {
    return undefined;
  }

  switch (subPath.split('?')[0]) {
    case '':
      return AZURE_MOCK_PROVIDER_INVENTORY;
    case 'networks':
      return AZURE_MOCK_NETWORKS;
    case 'storages':
      return AZURE_MOCK_STORAGES;
    case 'vms':
      return AZURE_MOCK_VMS;
    default:
      return undefined;
  }
};
