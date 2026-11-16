export enum MigrationType {
  COLD = 'cold',
  LIVE = 'live',
  WARM = 'warm',
}

export enum ProviderType {
  AZURE = 'azure',
  EC2 = 'ec2',
  HYPERV = 'hyperv',
  NUTANIX = 'nutanix',
  OPENSTACK = 'openstack',
  OVA = 'ova',
  OVIRT = 'ovirt',
  VSPHERE = 'vsphere',
}

export enum EndpointType {
  VCENTER = 'vcenter',
  ESXI = 'esxi',
}

export enum HookSource {
  AAP = 'aap',
  LOCAL = 'local',
  NONE = 'none',
}
