export enum ProvidersResourceFieldId {
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
  DatacenterCount = 'datacenterCount',
  Product = 'product',
  VolumeTypeCount = 'volumeTypeCount',
  ProjectCount = 'projectCount',
  RegionCount = 'regionCount',
}

export const PROVIDER_TYPES = {
  openshift: 'openshift',
  openstack: 'openstack',
  ova: 'ova',
  ovirt: 'ovirt',
  vsphere: 'vsphere',
} as const;
