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

export enum PROVIDER_TYPES {
  openshift = 'openshift',
  openstack = 'openstack',
  ovirt = 'ovirt',
  vsphere = 'vsphere',
  ova = 'ova',
}
