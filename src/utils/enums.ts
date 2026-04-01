import type { ProviderType } from '@forklift-ui/types';

export type ExtendedProviderType = ProviderType | 'ec2';

export const PROVIDERS: Record<ExtendedProviderType, string> =
  process.env.BRAND_TYPE === 'RedHat'
    ? {
        ec2: 'Amazon EC2',
        hyperv: 'HyperV',
        openshift: 'OpenShift',
        openstack: 'OpenStack',
        ova: 'OVA',
        ovirt: 'RHV',
        vsphere: 'VMware',
      }
    : {
        ec2: 'Amazon EC2',
        hyperv: 'HyperV',
        openshift: 'KubeVirt',
        openstack: 'OpenStack',
        ova: 'OVA',
        ovirt: 'oVirt',
        vsphere: 'VMware',
      };
