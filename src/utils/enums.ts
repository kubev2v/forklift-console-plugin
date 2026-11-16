import type { ProviderType } from '@forklift-ui/types';

export type ExtendedProviderType = ProviderType | 'azure';

export const PROVIDERS: Record<ExtendedProviderType, string> =
  process.env.BRAND_TYPE === 'RedHat'
    ? {
        azure: 'Microsoft Azure',
        ec2: 'Amazon EC2',
        hyperv: 'HyperV',
        nutanix: 'Nutanix AHV',
        openshift: 'OpenShift',
        openstack: 'OpenStack',
        ova: 'OVA',
        ovirt: 'RHV',
        vsphere: 'VMware',
      }
    : {
        azure: 'Microsoft Azure',
        ec2: 'Amazon EC2',
        hyperv: 'HyperV',
        nutanix: 'Nutanix AHV',
        openshift: 'KubeVirt',
        openstack: 'OpenStack',
        ova: 'OVA',
        ovirt: 'oVirt',
        vsphere: 'VMware',
      };
