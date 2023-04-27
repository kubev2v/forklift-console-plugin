import { OpenShiftStorageClass } from './OpenShiftStorageClass';
import { OpenstackVolumeType } from './OpenstackVolumeType';
import { OVirtStorageDomains } from './OVirtStorageDomains';
import { VSphereDataStores } from './VSphereDataStores';

export type StorageTypesInventory =
  | OpenstackVolumeType
  | OpenShiftStorageClass
  | VSphereDataStores
  | OVirtStorageDomains;
