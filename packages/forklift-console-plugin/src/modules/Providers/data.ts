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

export const useProvidersWithInventory = ({
  namespace,
  name = undefined,
  groupVersionKind: { group, version },
}): [MergedProvider[], boolean, unknown, unknown, unknown] => {
  const [providers, providersLoaded, providersError] = useProviders(
    { namespace, name },
    { group, version },
  );
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
