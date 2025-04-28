import type { ProviderType } from '@kubev2v/types';

export const PROVIDERS: Record<ProviderType, string> =
  process.env.BRAND_TYPE === 'RedHat'
    ? {
        openshift: 'OpenShift',
        openstack: 'OpenStack',
        ova: 'OVA',
        ovirt: 'RHV',
        vsphere: 'VMware',
      }
    : {
        openshift: 'KubeVirt',
        openstack: 'OpenStack',
        ova: 'OVA',
        ovirt: 'oVirt',
        vsphere: 'VMware',
      };
