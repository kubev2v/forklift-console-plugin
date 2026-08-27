import type {
  NutanixProvider,
  NutanixVM,
  ProviderInventory,
  ProviderVirtualMachine,
} from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

export type { NutanixStorageContainer } from '@forklift-ui/types';

export const isNutanixVm = (vm: ProviderVirtualMachine): vm is NutanixVM =>
  vm.providerType === PROVIDER_TYPES.nutanix;

export const isNutanixProviderInventory = (
  inventory: ProviderInventory,
): inventory is NutanixProvider => inventory.type === PROVIDER_TYPES.nutanix;

export const getNutanixSubnetIds = (vm: NutanixVM): string[] =>
  vm.nics?.map((nic) => nic.subnetUuid).filter((id): id is string => Boolean(id)) ?? [];

export const getNutanixStorageContainerIds = (vm: NutanixVM): string[] =>
  vm.disks?.map((disk) => disk.storageContainerUuid).filter((id): id is string => Boolean(id)) ??
  [];
