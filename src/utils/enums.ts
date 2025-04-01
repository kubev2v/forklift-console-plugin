import type { ProviderType } from '@kubev2v/types';

import type { ProviderStatus } from './types';

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

export const PROVIDER_STATUS: Record<ProviderStatus, string> = {
  ConnectionFailed: 'Connection Failed',
  Ready: 'Ready',
  Staging: 'Staging',
  Unknown: 'Unknown',
  ValidationFailed: 'Validation Failed',
};
