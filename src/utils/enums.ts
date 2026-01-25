import type { ProviderType } from '@forklift-ui/types';

export const PROVIDERS: Record<ProviderType, string> =
  process.env.BRAND_TYPE === 'RedHat'
    ? {
        hyperv: 'HyperV',
        openshift: 'OpenShift',
        openstack: 'OpenStack',
        ova: 'OVA',
        ovirt: 'RHV',
        vsphere: 'VMware',
      }
    : {
        hyperv: 'HyperV',
        openshift: 'KubeVirt',
        openstack: 'OpenStack',
        ova: 'OVA',
        ovirt: 'oVirt',
        vsphere: 'VMware',
      };
