import { useProviders } from 'src/utils/fetch';

import { useInventoryProvidersQuery } from '@kubev2v/legacy/queries';
import {
  IOpenShiftProvider,
  IOpenStackProvider,
  IProvidersByType,
  IRHVProvider,
  IVMwareProvider,
} from '@kubev2v/legacy/queries/types';
import { V1beta1Provider } from '@kubev2v/types';

export type CommonInventory = Partial<
  IVMwareProvider & IRHVProvider & IOpenShiftProvider & IOpenStackProvider
>;
export type MergedProvider = V1beta1Provider & { inventory: CommonInventory };

export const isManaged = (resourceData: V1beta1Provider) =>
  (resourceData?.metadata?.ownerReferences?.length ?? 0) > 0;

export type GetFlatDataFn = {
  ({
    providers,
    inventory,
  }: {
    providers: V1beta1Provider[];
    inventory: IProvidersByType;
  }): MergedProvider[];
};
export const getFlatData: GetFlatDataFn = ({ providers, inventory }) => {
  const inventoryMap: Record<string, CommonInventory> = {};
  (inventory
    ? [...inventory.openshift, ...inventory.openstack, ...inventory.ovirt, ...inventory.vsphere]
    : []
  ).forEach((p) => {
    inventoryMap[p.uid] = p;
  });
  const flatData = providers.map((p) => {
    const inventory = inventoryMap[p?.metadata?.uid];

    return {
      ...p,
      inventory: {
        ...inventory,
        storageCount:
          inventory?.storageDomainCount ?? inventory?.datastoreCount ?? inventory?.volumeTypeCount,
      },
    };
  });

  return flatData;
};

export const useHasSourceAndTargetProviders = (
  namespace?: string,
): [boolean, boolean, boolean, unknown] => {
  const [providers, providersLoaded, providersError] = useProviders({
    namespace,
  });

  const hasSourceProviders = providers.some((p) => p?.spec?.type !== 'openshift');
  const hasTargetProviders = providers.some((p) => p?.spec?.type === 'openshift');

  return [hasSourceProviders, hasTargetProviders, providersLoaded, providersError];
};

export const useHasSufficientProviders = (namespace?: string) => {
  const [hasSourceProviders, hasTargetProviders, providersLoaded, providersError] =
    useHasSourceAndTargetProviders(namespace);
  const hasSufficientProviders =
    hasSourceProviders && hasTargetProviders && providersLoaded && !providersError;

  return hasSufficientProviders;
};

export const useProvidersWithInventory = ({
  namespace,
}): [MergedProvider[], boolean, unknown, unknown, unknown] => {
  const [providers, providersLoaded, providersError] = useProviders({
    namespace,
  });
  const {
    data: inventory,
    isSuccess: inventoryLoaded,
    isError: inventoryError,
  } = useInventoryProvidersQuery();

  const flatData = getFlatData({ providers, inventory });

  return [
    flatData,
    providersLoaded && inventoryLoaded,
    providersError || inventoryError,
    { providers, providersLoaded, providersError },
    { inventory, inventoryLoaded, inventoryError },
  ];
};
