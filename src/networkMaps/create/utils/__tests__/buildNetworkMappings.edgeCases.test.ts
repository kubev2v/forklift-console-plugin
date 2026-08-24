import { buildNetworkMappings } from '../buildNetworkMappings';

import {
  DEFAULT_NETWORK,
  mockNetworkMapping,
  mockVMwareProvider,
  NetworkMapFieldId,
} from './buildNetworkMappings.fixtures';

describe('buildNetworkMappings - namespace/name parsing', () => {
  it('should parse namespace/name from target network name', () => {
    const mappings = [
      {
        [NetworkMapFieldId.SourceNetwork]: { name: 'source-network', id: 'source-network' },
        [NetworkMapFieldId.TargetNetwork]: { name: 'my-namespace/my-nad', id: 'some-uid' },
      },
    ];

    const result = buildNetworkMappings(mappings, mockVMwareProvider);

    expect(result).toEqual([
      {
        destination: {
          name: 'my-nad',
          namespace: 'my-namespace',
          type: 'multus',
        },
        source: { id: 'source-network', name: 'source-network' },
      },
    ]);
  });

  it('should fall back to id as namespace when name has no slash', () => {
    const mappings = [
      {
        [NetworkMapFieldId.SourceNetwork]: { name: 'source-network', id: 'source-network' },
        [NetworkMapFieldId.TargetNetwork]: { name: 'bare-name', id: 'fallback-ns' },
      },
    ];

    const result = buildNetworkMappings(mappings, mockVMwareProvider);

    expect(result).toEqual([
      {
        destination: {
          name: 'bare-name',
          namespace: 'fallback-ns',
          type: 'multus',
        },
        source: { id: 'source-network', name: 'source-network' },
      },
    ]);
  });
});

describe('buildNetworkMappings - edge cases', () => {
  it('should filter out mappings with missing source network name', () => {
    const mappings = [
      mockNetworkMapping,
      {
        [NetworkMapFieldId.SourceNetwork]: { name: '', id: '' },
        [NetworkMapFieldId.TargetNetwork]: { name: 'target-network', id: 'target-ns' },
      },
    ];

    const result = buildNetworkMappings(mappings, mockVMwareProvider);

    expect(result).toHaveLength(1);
    expect(result[0].source.id).toBe('source-network');
  });

  it('should filter out mappings with missing target network name', () => {
    const mappings = [
      mockNetworkMapping,
      {
        [NetworkMapFieldId.SourceNetwork]: { name: 'source-network', id: 'source-network' },
        [NetworkMapFieldId.TargetNetwork]: { name: '', id: '' },
      },
    ];

    const result = buildNetworkMappings(mappings, mockVMwareProvider);

    expect(result).toHaveLength(1);
    expect(result[0].source.id).toBe('source-network');
  });

  it('should return empty array when no valid mappings provided', () => {
    const mappings = [
      {
        [NetworkMapFieldId.SourceNetwork]: { name: '' },
        [NetworkMapFieldId.TargetNetwork]: { name: '' },
      },
    ];

    const result = buildNetworkMappings(mappings, mockVMwareProvider);

    expect(result).toEqual([]);
  });

  it('should handle multiple valid mappings', () => {
    const mappings = [
      mockNetworkMapping,
      {
        [NetworkMapFieldId.SourceNetwork]: { name: 'source-network-2' },
        [NetworkMapFieldId.TargetNetwork]: { name: DEFAULT_NETWORK },
      },
    ];

    const result = buildNetworkMappings(mappings, mockVMwareProvider);

    expect(result).toHaveLength(2);
    expect(result[0].destination.type).toBe('multus');
    expect(result[1].destination.type).toBe('pod');
  });
});
