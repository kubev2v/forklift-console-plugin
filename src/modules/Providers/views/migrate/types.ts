import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';

import type { ResourceField } from '@components/common/utils/types';
import type {
  OpenShiftNamespace,
  OpenshiftResource,
  OpenShiftStorageClass,
  OpenstackVolume,
  OVirtDisk,
  OVirtNicProfile,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@kubev2v/types';

import type { InventoryNetwork } from '../../hooks/useNetworks';
import type { InventoryStorage } from '../../hooks/useStorages';
import type { Validation } from '../../utils/types/Validation';
import type { VmData } from '../details/tabs/VirtualMachines/components/VMCellProps';

import type { CreateVmMigration } from './reducer/actions';

export type CreateVmMigrationPageState = {
  underConstruction: {
    plan: V1beta1Plan;
    projectName: string;
    netMap: V1beta1NetworkMap;
    storageMap: V1beta1StorageMap;
  };

  validation: {
    planName: Validation;
    projectName: Validation;
    targetNamespace: Validation;
    targetProvider: Validation;
    networkMappings: Validation;
    storageMappings: Validation;
  };
  alerts: {
    networkMappings: {
      errors: NetworkAlerts[];
      warnings: NetworkAlerts[];
    };
    storageMappings: {
      errors: StorageAlerts[];
      warnings: StorageAlerts[];
    };
  };
  // data fetched from k8s or inventory
  existingResources: {
    providers: V1beta1Provider[];
    plans: V1beta1Plan[];
    targetNamespaces: OpenShiftNamespace[];
    targetNetworks: OpenshiftResource[];
    sourceNetworks: InventoryNetwork[];
    targetStorages: OpenShiftStorageClass[];
    sourceStorages: InventoryStorage[];
    nicProfiles: OVirtNicProfile[];
    disks: (OVirtDisk | OpenstackVolume)[];
    netMaps: V1beta1NetworkMap[];
    storageMaps: V1beta1StorageMap[];
  };
  calculatedOnce: {
    // calculated on start (exception:for ovirt/openstack we need to fetch disks)
    storageIdsUsedBySelectedVms: string[];
    sourceStorageLabelToId: Record<string, string>;
    // calculated on start (exception:for ovirt we need to fetch nic profiles)
    networkIdsUsedBySelectedVms: string[];
    sourceNetworkLabelToId: Record<string, string>;
    // calculated on start
    vmFieldsFactory: [ResourceField[], FC<RowProps<VmData>>];
    // for OpenShift source providers
    namespacesUsedBySelectedVms: string[];
  };
  // re-calculated on every target namespace change
  calculatedPerNamespace: {
    // read-only
    targetStorages: string[];
    // read-only, human-readable
    targetNetworks: string[];
    sourceNetworks: MappingSource[];
    sourceStorages: MappingSource[];
    // mutated, both source and destination human-readable
    networkMappings: Mapping[];
    storageMappings: Mapping[];
  };
  receivedAsParams: {
    selectedVms: VmData[];
    sourceProvider: V1beta1Provider;
    namespace: string;
  };
  // placeholder for helper data
  workArea: {
    targetProvider: V1beta1Provider;
  };
  flow: {
    editingDone: boolean;
    apiError?: Error;
    initialLoading: Partial<Record<CreateVmMigration, boolean>>;
  };
};
export type MappingSource = {
  // read-only
  label: string;
  usedBySelectedVms: boolean;
  // mutated via UI
  isMapped: boolean;
};

export type Mapping = {
  source: string;
  destination: string;
};

type NET_MAP_NAME_REGENERATED = 'NET_MAP_NAME_REGENERATED';
export const NETWORK_MAPPING_REGENERATED = 'NETWORK_MAPPING_REGENERATED';
export const NETWORK_MAPPING_EMPTY = 'NETWORK_MAPPING_EMPTY';
export const OVIRT_NICS_WITH_EMPTY_PROFILE = 'OVIRT_NICS_WITH_EMPTY_PROFILE';
export const MULTIPLE_NICS_ON_THE_SAME_NETWORK = 'MULTIPLE_NICS_ON_THE_SAME_NETWORK';
export const UNMAPPED_NETWORKS = 'UNMAPPED_NETWORKS';
export const MULTIPLE_NICS_MAPPED_TO_POD_NETWORKING = 'MULTIPLE_NICS_MAPPED_TO_POD_NETWORKING';

export const STORAGE_MAPPING_REGENERATED = 'STORAGE_MAPPING_REGENERATED';
type STORAGE_MAP_NAME_REGENERATED = 'STORAGE_MAP_NAME_REGENERATED';
export const UNMAPPED_STORAGES = 'UNMAPPED_STORAGES';
export const STORAGE_MAPPING_EMPTY = 'STORAGE_MAPPING_EMPTY';

export type NetworkAlerts =
  | NET_MAP_NAME_REGENERATED
  | typeof NETWORK_MAPPING_REGENERATED
  | typeof NETWORK_MAPPING_EMPTY
  | typeof UNMAPPED_NETWORKS
  | typeof OVIRT_NICS_WITH_EMPTY_PROFILE
  | typeof MULTIPLE_NICS_ON_THE_SAME_NETWORK
  | typeof MULTIPLE_NICS_MAPPED_TO_POD_NETWORKING;

export type StorageAlerts =
  | typeof STORAGE_MAPPING_REGENERATED
  | STORAGE_MAP_NAME_REGENERATED
  | typeof STORAGE_MAPPING_EMPTY
  | typeof UNMAPPED_STORAGES;
