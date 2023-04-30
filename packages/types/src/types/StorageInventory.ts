import { OpenShiftStorageClass } from './storage/OpenShiftStorageClass';
import { OpenstackVolumeType } from './storage/OpenstackVolumeType';
import { OVirtStorageDomain } from './storage/OVirtStorageDomain';
import { VSphereDataStore } from './storage/VSphereDataStore';

export type StorageInventory =
  | OpenstackVolumeType
  | OpenShiftStorageClass
  | VSphereDataStore
  | OVirtStorageDomain;
