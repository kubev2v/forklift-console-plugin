export enum PROVIDER_TYPES {
  openshift = 'openshift',
  openstack = 'openstack',
  ovirt = 'ovirt',
  vsphere = 'vsphere',
  ova = 'ova',
}

/**
 * List of fields to ignore/skip comparing when checking if an inventory's object has changed and required
 * re-rendering.
 *
 * Note: The fields included in this list have values which are changed occasionally in inventory
 * while not displayed in UI and therefore if not ignored it will
 * generate frequent unnecessary re-rendering.
 *
 * Need to add more fields to this if required.
 */
export const DEFAULT_FIELDS_TO_AVOID_COMPARING = ['revision', 'revisionValidated', 'storageUsed'];

export enum ProvidersTableResourceFieldId {
  Name = 'name',
  Namespace = 'namespace',
  Phase = 'phase',
  Url = 'url',
  Type = 'type',
  VmCount = 'vmCount',
  NetworkCount = 'networkCount',
  ClusterCount = 'clusterCount',
  HostCount = 'hostCount',
  StorageCount = 'storageCount',
  Actions = 'actions',
}
