export const PROVIDER_TYPES = {
  ec2: 'ec2',
  hyperv: 'hyperv',
  openshift: 'openshift',
  openstack: 'openstack',
  ova: 'ova',
  ovirt: 'ovirt',
  vsphere: 'vsphere',
} as const;

export type ProviderTypes = (typeof PROVIDER_TYPES)[keyof typeof PROVIDER_TYPES];

const TECH_PREVIEW_PROVIDER_TYPES: readonly ProviderTypes[] = [
  PROVIDER_TYPES.ec2,
  PROVIDER_TYPES.hyperv,
] as const;

export const isTechPreviewProvider = (type: string): boolean =>
  TECH_PREVIEW_PROVIDER_TYPES.includes(type as ProviderTypes);
