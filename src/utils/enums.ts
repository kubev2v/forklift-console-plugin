import { ProviderType } from '@kubev2v/types';

import { ProviderStatus } from './types';

export const PROVIDERS: Record<ProviderType, string> =
  process.env.BRAND_TYPE === 'RedHat'
    ? {
        vsphere: 'VMware',
        ovirt: 'RHV',
        openstack: 'OpenStack',
        openshift: 'OpenShift',
        ova: 'OVA',
      }
    : {
        vsphere: 'VMware',
        ovirt: 'oVirt',
        openstack: 'OpenStack',
        openshift: 'KubeVirt',
        ova: 'OVA',
      };

export const PROVIDER_STATUS: Record<ProviderStatus, string> = {
  Ready: 'Ready',
  ConnectionFailed: 'Connection Failed',
  Staging: 'Staging',
  ValidationFailed: 'Validation Failed',
  Unknown: 'Unknown',
};
