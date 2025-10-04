import { useMemo } from 'react';
import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';

import type {
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { getName } from '@utils/crds/common/selectors';
import { getPlanNetworkMapName, getPlanStorageMapName } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

type UsePlanMappingDataOptions = {
  plan: V1beta1Plan;
  networkMaps: V1beta1NetworkMap[];
  storageMaps: V1beta1StorageMap[];
  providerStorages: InventoryStorage[];
  providerNetworks: InventoryNetwork[];
  sourceProvider?: V1beta1Provider;
};

/**
 * Returns source storage/network data with fallback to map references
 * when provider inventory is unavailable.
 */
export const usePlanMappingData = ({
  networkMaps,
  plan,
  providerNetworks,
  providerStorages,
  sourceProvider,
  storageMaps,
}: UsePlanMappingDataOptions) => {
  const planNetworkMap = useMemo(
    () => networkMaps.find((map) => getName(map) === getPlanNetworkMapName(plan)),
    [networkMaps, plan],
  );

  const planStorageMap = useMemo(
    () => storageMaps.find((map) => getName(map) === getPlanStorageMapName(plan)),
    [storageMaps, plan],
  );

  const sourceStorages = useMemo(() => {
    if (!isEmpty(providerStorages)) return providerStorages;

    return (planStorageMap?.status?.references ?? []).map((ref) => ({
      id: ref.id ?? '',
      name: ref.name ?? '',
      providerType: sourceProvider?.spec?.type,
    })) as InventoryStorage[];
  }, [providerStorages, planStorageMap, sourceProvider]);

  const sourceNetworks = useMemo(() => {
    if (!isEmpty(providerNetworks)) return providerNetworks;

    return (planNetworkMap?.status?.references ?? []).map((ref) => ({
      id: ref.id ?? '',
      name: ref.name ?? '',
      providerType: sourceProvider?.spec?.type,
    })) as InventoryNetwork[];
  }, [providerNetworks, planNetworkMap, sourceProvider]);

  return {
    planNetworkMap,
    planStorageMap,
    sourceNetworks,
    sourceStorages,
  };
};
