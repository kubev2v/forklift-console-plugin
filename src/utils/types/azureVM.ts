// Azure inventory types are defined locally because @forklift-ui/types does not
// include Azure provider, VM or inventory types yet.
// https://github.com/kubev2v/forklift/tree/main/pkg/provider/azure/inventory

import { PROVIDER_TYPES } from '@utils/providers/constants';

type AzurePowerState = 'off' | 'on' | 'unknown';

type AzureNic = {
  id?: string;
  name?: string;
  primary?: boolean;
};

export type AzureDisk = {
  id?: string;
  isOS?: boolean;
  name?: string;
  osType?: string;
  sizeGB?: number;
  sku?: string;
};

export type AzureVmObject = {
  cpuCount?: number;
  disks?: AzureDisk[];
  guestId?: string;
  managedDisks?: AzureDisk[];
  memoryMB?: number;
  networkInterfaces?: AzureNic[];
  powerState?: string;
  properties?: {
    hardwareProfile?: { vmSize?: string };
    storageProfile?: {
      dataDisks?: { managedDisk?: { storageAccountType?: string } }[];
      osDisk?: { osType?: string };
    };
  };
};

// Azure VM as returned by /providers/azure/{uid}/vms.
export type AzureVM = {
  cpuCount?: number;
  disks?: AzureDisk[];
  id?: string;
  memoryMB?: number;
  name?: string;
  object?: AzureVmObject;
  powerState?: string;
  providerType: string;
};

type AzureVmGuardInput = { providerType?: string } | undefined;

export const isAzureVm = (vm: AzureVmGuardInput): vm is AzureVM =>
  vm?.providerType === PROVIDER_TYPES.azure;

export const getAzureVM = (data: unknown): AzureVM | undefined =>
  (data as { vm?: unknown })?.vm as AzureVM | undefined;

export const getAzureVmPowerState = (vm: AzureVM | undefined): AzurePowerState => {
  const powerState = (vm?.powerState ?? vm?.object?.powerState ?? '').toLowerCase();

  if (powerState === 'running') {
    return 'on';
  }

  if (powerState === 'deallocated' || powerState === 'stopped') {
    return 'off';
  }

  return 'unknown';
};

export const getAzureNicIds = (vm: AzureVM | undefined): string[] =>
  vm?.object?.networkInterfaces?.reduce<string[]>((acc, nic) => {
    return nic?.id ? [...acc, nic.id] : acc;
  }, []) ?? [];

export const getAzureNicLabel = (nicId: string): string => {
  const segments = nicId.split('/').filter(Boolean);
  const name = segments[segments.length - 1] ?? '';

  return name || nicId;
};

export const getAzureDiskTypes = (vm: AzureVM | undefined): string[] => {
  const disks = vm?.object?.managedDisks?.length
    ? vm.object.managedDisks
    : (vm?.object?.disks ?? vm?.disks ?? []);

  return disks.reduce<string[]>((acc, disk) => {
    return disk?.sku ? [...acc, disk.sku] : acc;
  }, []);
};
