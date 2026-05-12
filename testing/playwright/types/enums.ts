export enum MigrationType {
  COLD = 'cold',
  LIVE = 'live',
  WARM = 'warm',
}

export enum ProviderType {
  EC2 = 'ec2',
  HYPERV = 'hyperv',
  OPENSTACK = 'openstack',
  OVA = 'ova',
  OVIRT = 'ovirt',
  VSPHERE = 'vsphere',
}

export enum EndpointType {
  VCENTER = 'vcenter',
  ESXI = 'esxi',
}
