import { getMapResourceLabel } from 'src/plans/create/steps/utils';
import type { CategorizedSourceMappings } from 'src/plans/create/types';
import type { InventoryStorage } from 'src/utils/hooks/useStorages';

import type { ProviderVirtualMachine, V1beta1Provider } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { getStoragesUsedBySelectedVms } from './vmStorageIdExtractors';

const getSourceStorageValues = (
  availableSourceStorages: InventoryStorage[],
  vms: ProviderVirtualMachine[] | null,
): CategorizedSourceMappings => {
  const storageIdsUsedByVms = getStoragesUsedBySelectedVms(vms);
  const usedStorageIds = new Set(storageIdsUsedByVms);

  return availableSourceStorages.reduce<CategorizedSourceMappings>(
    (acc, storage) => {
      const storageEntry = {
        id: storage.id,
        name: getMapResourceLabel(storage),
      };

      if (
        usedStorageIds.has(storage.id) ||
        (storage.providerType === PROVIDER_TYPES.openshift && !isEmpty(usedStorageIds))
      ) {
        acc.used.push(storageEntry);
      } else {
        acc.other.push(storageEntry);
      }

      return acc;
    },
    { other: [], used: [] },
  );
};

const filterStoragesByVmUsage = (
  availableStorages: InventoryStorage[],
  vms: ProviderVirtualMachine[] | null,
): InventoryStorage[] => {
  const storageIdsUsedByVms = getStoragesUsedBySelectedVms(vms);
  const usedStorageIds = new Set(storageIdsUsedByVms);
  return availableStorages.filter((storage) => usedStorageIds.has(storage.id));
};

export const getSourceStorageValuesForSelectedVms = (
  sourceProvider: V1beta1Provider | undefined,
  availableSourceStorages: InventoryStorage[],
  vms: ProviderVirtualMachine[] | null,
): CategorizedSourceMappings => {
  const sourceProviderType = sourceProvider?.spec?.type;

  if (sourceProviderType === PROVIDER_TYPES.ec2) {
    return {
      other: [],
      used: availableSourceStorages.map((storage) => ({
        id: storage.id,
        name: getMapResourceLabel(storage),
      })),
    };
  }

  const relevantStorages =
    sourceProviderType === PROVIDER_TYPES.ova
      ? filterStoragesByVmUsage(availableSourceStorages, vms)
      : availableSourceStorages;

  return getSourceStorageValues(relevantStorages, vms);
};
