import type { V1beta1Provider } from '@forklift-ui/types';

export const validProvider: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name: 'vsphere-provider', namespace: 'openshift-mtv', uid: 'provider-uid-1' },
  spec: { type: 'vsphere', url: 'https://vcenter.example.com' },
};

export const providerMissingUid: V1beta1Provider = {
  ...validProvider,
  metadata: { name: 'vsphere-provider', namespace: 'openshift-mtv' },
};

export const providerMissingType: V1beta1Provider = {
  ...validProvider,
  spec: { url: 'https://vcenter.example.com' },
};

export const inventorySample = {
  name: 'inventory-sample',
  revision: 1,
  storageUsed: 100,
  vms: [{ id: 'vm-1', name: 'vm-one' }],
};

export const inventorySameIgnoredFields = {
  ...inventorySample,
  revision: 99,
  storageUsed: 999,
};
