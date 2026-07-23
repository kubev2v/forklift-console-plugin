// Nutanix inventory types — defined locally because @forklift-ui/types
// does not include Nutanix inventory types yet (tracked in MTV-6226).

import type { ProviderVirtualMachine } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

type NutanixNic = {
  subnetName?: string;
  subnetUuid?: string;
  uuid?: string;
};

type NutanixDisk = {
  diskSizeBytes?: number;
  diskSizeMib?: number;
  storageContainerName?: string;
  storageContainerUuid?: string;
  uuid?: string;
};

export type NutanixStorageContainer = {
  cluster?: string;
  freeBytes?: number;
  id: string;
  maxCapacityBytes?: number;
  name: string;
  providerType: typeof PROVIDER_TYPES.nutanix;
  revision: number;
  selfLink: string;
  storageContainerUuid?: string;
  usageBytes?: number;
};

type NutanixVmLike = ProviderVirtualMachine & {
  cluster?: string;
  disks?: NutanixDisk[];
  guestOsId?: string;
  host?: string;
  memorySizeMib?: number;
  nics?: NutanixNic[];
  numSockets?: number;
  numVcpusPerSocket?: number;
  powerState?: string;
};

export const isNutanixVm = (vm: ProviderVirtualMachine): vm is NutanixVmLike =>
  (vm.providerType as string) === PROVIDER_TYPES.nutanix;

export const getNutanixSubnetIds = (vm: NutanixVmLike): string[] =>
  vm.nics?.map((nic) => nic.subnetUuid).filter((id): id is string => Boolean(id)) ?? [];

export const getNutanixStorageContainerIds = (vm: NutanixVmLike): string[] =>
  vm.disks?.map((disk) => disk.storageContainerUuid).filter((id): id is string => Boolean(id)) ??
  [];
