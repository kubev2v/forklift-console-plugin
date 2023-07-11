import { ProviderType } from '@kubev2v/types';

export const DEFAULT_FIELDS_TO_COMPARE = [
  'vmCount',
  'networkCount',
  'storageClassCount',
  'regionCount',
  'projectCount',
  'imageCount',
  'volumeCount',
  'volumeTypeCount',
  'datacenterCount',
  'clusterCount',
  'hostCount',
  'storageDomainCount',
  'datastoreCount',
];

export const INVENTORY_TYPES: ProviderType[] = ['openshift', 'openstack', 'ovirt', 'vsphere'];
