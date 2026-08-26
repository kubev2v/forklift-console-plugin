import type { V1beta1Provider } from '@forklift-ui/types';
import { DEFAULT_NETWORK, POD } from '@utils/constants';
import { IgnoreNetwork } from '@utils/mappings/constants';
import { NetworkMapFieldId, type NetworkMapping } from '@utils/mappings/networkMap';
import { PROVIDER_TYPES } from '@utils/providers/constants';

export const vsphereProvider: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name: 'vsphere-src', namespace: 'openshift-mtv', uid: 'src-uid' },
  spec: { type: PROVIDER_TYPES.vsphere, secret: {} },
};

export const openshiftProvider: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name: 'ocp-src', namespace: 'openshift-mtv', uid: 'ocp-uid' },
  spec: { type: PROVIDER_TYPES.openshift, secret: {} },
};

export const targetProvider: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name: 'ocp-tgt', namespace: 'openshift-mtv', uid: 'tgt-uid' },
  spec: { type: PROVIDER_TYPES.openshift, secret: {} },
};

export const baseParams = {
  name: 'net-map-1',
  project: 'plan-ns',
  sourceProvider: vsphereProvider,
  targetNamespace: 'target-ns',
  targetProvider,
};

export const multusMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { id: 'net-1', name: 'VM Network' },
  [NetworkMapFieldId.TargetNetwork]: { name: 'nad-ns/my-nad' },
};

export const podTargetMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { id: 'net-2', name: 'Mgmt' },
  [NetworkMapFieldId.TargetNetwork]: { name: DEFAULT_NETWORK },
};

export const ignoreTargetMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { id: 'net-3', name: 'Isolated' },
  [NetworkMapFieldId.TargetNetwork]: { name: IgnoreNetwork.Label },
};

export const podSourceMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { id: POD, name: 'Pod network' },
  [NetworkMapFieldId.TargetNetwork]: { name: 'target-ns/pod-nad' },
};

export const vlanMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { id: 'net-vlan', name: 'VLAN100', vlan: '100' },
  [NetworkMapFieldId.TargetNetwork]: { name: 'plain-nad' },
};

export const emptySourceMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { name: '' },
  [NetworkMapFieldId.TargetNetwork]: { name: 'ignored-target' },
};

export const createdNetworkMap = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'NetworkMap',
  metadata: { name: 'net-map-1', namespace: 'plan-ns', uid: 'created-uid' },
};
