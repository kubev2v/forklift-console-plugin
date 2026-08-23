import type { V1beta1Provider } from '@forklift-ui/types';
import { DEFAULT_NETWORK } from '@utils/constants';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

export const mockOpenShiftProvider: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  spec: {
    type: PROVIDER_TYPES.openshift,
    secret: {},
  },
  metadata: { name: 'test-openshift-provider' },
};

export const mockVMwareProvider: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  spec: {
    type: PROVIDER_TYPES.vsphere,
    secret: {},
  },
  metadata: { name: 'test-vmware-provider' },
};

export const mockNetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { name: 'source-network', id: 'source-network' },
  [NetworkMapFieldId.TargetNetwork]: { name: 'target-network', id: 'target-ns' },
};

export { DEFAULT_NETWORK, NetworkMapFieldId };
