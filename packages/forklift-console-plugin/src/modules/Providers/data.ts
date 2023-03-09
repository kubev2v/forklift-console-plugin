import { useMemo } from 'react';
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

export type MergedProvider = V1beta1Provider & { inventory: FlattenedInventory };

// may be empty when there is no inventory (yet)
type FlattenedInventory = Partial<
  IVMwareProvider & IRHVProvider & IOpenShiftProvider & IOpenStackProvider
>;

export const groupPairs = (
  resources: V1beta1Provider[],
  inventory: IProvidersByType,
): [V1beta1Provider, FlattenedInventory][] => {
  const inventoryMap: { [key: string]: FlattenedInventory } = Object.fromEntries(
    Object.values(inventory)
      .flat()
      .map((inventory) => [inventory?.uid, inventory])
      .filter(([uid, inventory]) => uid && inventory),
  );

  return resources
    .filter(Boolean)
    .map((resource): [string, V1beta1Provider] => [resource?.metadata?.uid, resource])
    .filter(([uid, resource]) => uid && resource)
    .map(([uid, resource]): [V1beta1Provider, FlattenedInventory] => [
      resource,
      inventoryMap[uid] ?? {},
    ]);
};

export const mergeData = (pairs: [V1beta1Provider, FlattenedInventory][]) =>
  pairs.map(([resource, inventory]) => ({
    ...resource,
    inventory: {
      ...inventory,
      storageCount:
        inventory.storageDomainCount ?? inventory.datastoreCount ?? inventory.volumeTypeCount,
    },
  }));

export const useProvidersWithInventory = ({
  namespace,
  name = undefined,
  groupVersionKind: { group, version },
}): [MergedProvider[], boolean, boolean] => {
  const [resources, loaded, error] = useProviders({ namespace, name }, { group, version });
  const { data, isSuccess, isError } = useInventoryProvidersQuery();
  const providersWithInventory = useMemo(
    () => (resources && data ? mergeData(groupPairs(resources, data)) : []),
    [resources, data],
  );

  const totalSuccess = loaded && isSuccess;
  const totalError = error || isError;
  // extra memo to keep the tuple reference stable
  // the tuple is used as data source and passed as prop
  // which triggres unnecessary re-renders
  return useMemo(
    () => [providersWithInventory, totalSuccess, totalError],
    [providersWithInventory, totalSuccess, totalError],
  );
};
