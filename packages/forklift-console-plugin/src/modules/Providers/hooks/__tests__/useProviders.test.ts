import { V1beta1Provider } from '@kubev2v/types';

import { getIsManaged, getIsOnlySource, getIsTarget } from '../../utils';

describe('Provider Utils', () => {
  describe('getIsManaged', () => {
    it('should return true if the provider has owner references', () => {
      const provider: V1beta1Provider = {
        metadata: {
          ownerReferences: [
            {
              apiVersion: '',
              kind: '',
              name: '',
              uid: '',
            },
          ],
        },
        apiVersion: '',
        kind: '',
      };

      expect(getIsManaged(provider)).toBe(true);
    });

    it('should return false if the provider has no owner references', () => {
      const provider: V1beta1Provider = {
        metadata: {},
        apiVersion: '',
        kind: '',
      };

      expect(getIsManaged(provider)).toBe(false);
    });
  });

  describe('getIsTarget', () => {
    it('should return true if the provider type is included in TARGET_PROVIDER_TYPES', () => {
      const provider: V1beta1Provider = {
        metadata: {},
        apiVersion: '',
        kind: '',
        spec: {
          type: 'openshift',
        },
      };

      expect(getIsTarget(provider)).toBe(true);
    });

    it('should return false if the provider type is not included in TARGET_PROVIDER_TYPES', () => {
      const provider: V1beta1Provider = {
        metadata: {},
        apiVersion: '',
        kind: '',
        spec: {
          type: 'nonTargetType',
        },
      };

      expect(getIsTarget(provider)).toBe(false);
    });
  });

  describe('getIsOnlySource', () => {
    it('should return true if the provider type is included in SOURCE_ONLY_PROVIDER_TYPES', () => {
      const provider: V1beta1Provider = {
        metadata: {},
        apiVersion: '',
        kind: '',
        spec: {
          type: 'vsphere',
        },
      };

      expect(getIsOnlySource(provider)).toBe(true);
    });

    it('should return false if the provider type is not included in SOURCE_ONLY_PROVIDER_TYPES', () => {
      const provider: V1beta1Provider = {
        metadata: {},
        apiVersion: '',
        kind: '',
        spec: {
          type: 'nonSourceType',
        },
      };

      expect(getIsOnlySource(provider)).toBe(false);
    });
  });
});
