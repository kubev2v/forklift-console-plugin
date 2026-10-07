import { POD } from '@utils/constants';

import { buildNetworkMappings } from '../buildNetworkMappings';

import {
  getDefaultNetworkLabel,
  mockNetworkMapping,
  mockOpenShiftProvider,
  mockVMwareProvider,
  NetworkMapFieldId,
} from './buildNetworkMappings.fixtures';

describe('buildNetworkMappings - OpenShift provider', () => {
  it('should create default network mapping for OpenShift provider with default target', () => {
    const mappings = [
      {
        ...mockNetworkMapping,
        [NetworkMapFieldId.TargetNetwork]: { name: getDefaultNetworkLabel() },
      },
    ];

    const result = buildNetworkMappings(mappings, mockOpenShiftProvider);

    expect(result).toEqual([
      {
        destination: { type: 'pod' },
        source: { name: 'source-network' },
      },
    ]);
  });

  it('should create multus network mapping for OpenShift provider with multus target', () => {
    const mappings = [mockNetworkMapping];

    const result = buildNetworkMappings(mappings, mockOpenShiftProvider);

    expect(result).toEqual([
      {
        destination: {
          name: 'target-network',
          namespace: 'target-ns',
          type: 'multus',
        },
        source: { name: 'source-network' },
      },
    ]);
  });

  it('should remove leading slash from source network name', () => {
    const mappings = [
      {
        ...mockNetworkMapping,
        [NetworkMapFieldId.SourceNetwork]: { name: '/source-network-with-slash' },
      },
    ];

    const result = buildNetworkMappings(mappings, mockOpenShiftProvider);

    expect(result[0].source.name).toBe('source-network-with-slash');
  });

  it('should parse namespace/name for OpenShift provider targets', () => {
    const mappings = [
      {
        [NetworkMapFieldId.SourceNetwork]: { name: 'source-network', id: 'source-network' },
        [NetworkMapFieldId.TargetNetwork]: { name: 'default/linux-bridge', id: 'uid-123' },
      },
    ];

    const result = buildNetworkMappings(mappings, mockOpenShiftProvider);

    expect(result).toEqual([
      {
        destination: {
          name: 'linux-bridge',
          namespace: 'default',
          type: 'multus',
        },
        source: { name: 'source-network' },
      },
    ]);
  });
});

describe('buildNetworkMappings - VMware provider', () => {
  it('should create default network mapping for VMware provider with default target', () => {
    const mappings = [
      {
        ...mockNetworkMapping,
        [NetworkMapFieldId.TargetNetwork]: { name: getDefaultNetworkLabel() },
      },
    ];

    const result = buildNetworkMappings(mappings, mockVMwareProvider);

    expect(result).toEqual([
      {
        destination: { type: 'pod' },
        source: { id: 'source-network', name: 'source-network' },
      },
    ]);
  });

  it('maps a pod id to the pod network when the stored label is from another language', () => {
    const mappings = [
      {
        ...mockNetworkMapping,
        [NetworkMapFieldId.TargetNetwork]: { id: POD, name: 'Red predeterminada' },
      },
    ];

    const result = buildNetworkMappings(mappings, mockVMwareProvider);

    expect(result[0].destination).toEqual({ type: 'pod' });
  });

  it('should create multus network mapping for VMware provider with multus target', () => {
    const mappings = [mockNetworkMapping];

    const result = buildNetworkMappings(mappings, mockVMwareProvider);

    expect(result).toEqual([
      {
        destination: {
          name: 'target-network',
          namespace: 'target-ns',
          type: 'multus',
        },
        source: { id: 'source-network', name: 'source-network' },
      },
    ]);
  });
});
