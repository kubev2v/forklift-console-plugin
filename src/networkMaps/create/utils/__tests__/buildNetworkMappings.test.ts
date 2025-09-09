import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@kubev2v/types';
import { DEFAULT_NETWORK } from '@utils/constants';

import { NetworkMapFieldId } from '../../../constants';
import { buildNetworkMappings } from '../buildNetworkMappings';

const mockOpenShiftProvider: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  spec: {
    type: PROVIDER_TYPES.openshift,
    secret: {},
  },
  metadata: { name: 'test-openshift-provider' },
};

const mockVMwareProvider: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  spec: {
    type: PROVIDER_TYPES.vsphere,
    secret: {},
  },
  metadata: { name: 'test-vmware-provider' },
};

const mockNetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { name: 'source-network', id: 'source-network' },
  [NetworkMapFieldId.TargetNetwork]: { name: 'target-network', id: 'target-ns' },
};

describe('buildNetworkMappings', () => {
  describe('OpenShift provider mappings', () => {
    it('should create default network mapping for OpenShift provider with default target', () => {
      const mappings = [
        {
          ...mockNetworkMapping,
          [NetworkMapFieldId.TargetNetwork]: { name: DEFAULT_NETWORK },
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
  });

  describe('Non-OpenShift provider mappings', () => {
    it('should create default network mapping for VMware provider with default target', () => {
      const mappings = [
        {
          ...mockNetworkMapping,
          [NetworkMapFieldId.TargetNetwork]: { name: DEFAULT_NETWORK },
        },
      ];

      const result = buildNetworkMappings(mappings, mockVMwareProvider);

      expect(result).toEqual([
        {
          destination: { type: 'pod' },
          source: { id: 'source-network' },
        },
      ]);
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
          source: { id: 'source-network' },
        },
      ]);
    });
  });

  describe('Edge cases and validation', () => {
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
});
