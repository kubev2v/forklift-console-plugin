import type { ProviderType } from '@forklift-ui/types';

export type ExtendedProviderType = ProviderType;

export const PROVIDERS: Record<ProviderType, string> =
  process.env.BRAND_TYPE === 'RedHat'
    ? {
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
        ec2: 'Amazon EC2',
        hyperv: 'HyperV',
        nutanix: 'Nutanix AHV',
        openshift: 'KubeVirt',
        openstack: 'OpenStack',
        ova: 'OVA',
        ovirt: 'oVirt',
        vsphere: 'VMware',
      };
