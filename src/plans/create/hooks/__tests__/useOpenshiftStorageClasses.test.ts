import { beforeEach, describe, expect, it } from '@jest/globals';
import type { IoK8sApiCoreV1PersistentVolumeClaim, OpenshiftVM } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react-hooks';

import { useOpenshiftStorageClasses } from '../useOpenshiftStorageClasses';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: jest.fn(),
}));

const mockUseK8sWatchResource = useK8sWatchResource as jest.MockedFunction<
  typeof useK8sWatchResource
>;

describe('useOpenshiftStorageClasses', () => {
  const mockProvider = { spec: { type: 'openshift' } } as any;
  const mockNonOpenshiftProvider = { spec: { type: 'vsphere' } } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic validation', () => {
    it('returns empty set when provider is not OpenShift', () => {
      mockUseK8sWatchResource.mockReturnValue([[], false, undefined]);

      const vms = [{ object: { metadata: { name: 'vm', namespace: 'ns' } } } as OpenshiftVM];
      const { result } = renderHook(() =>
        useOpenshiftStorageClasses(mockNonOpenshiftProvider, vms),
      );

      expect(result.current.usedStorageClasses).toEqual(new Set());
    });

    it('returns empty set when vms array is empty', () => {
      mockUseK8sWatchResource.mockReturnValue([[], false, undefined]);

      const { result } = renderHook(() => useOpenshiftStorageClasses(mockProvider, []));

      expect(result.current.usedStorageClasses).toEqual(new Set());
      expect(result.current.loading).toBe(false);
    });
  });

  describe('PVC-backed volumes', () => {
    it('extracts storage classes from PVC-backed volumes', () => {
      const pvcs: IoK8sApiCoreV1PersistentVolumeClaim[] = [
        {
          metadata: { name: 'pvc-1', namespace: 'test-ns' },
          spec: { storageClassName: 'pvc-storage' },
        } as IoK8sApiCoreV1PersistentVolumeClaim,
      ];
      mockUseK8sWatchResource.mockReturnValue([pvcs, true, undefined]);

      const vms = [
        {
          object: {
            metadata: { name: 'vm1', namespace: 'test-ns' },
            spec: {
              template: {
                spec: { volumes: [{ persistentVolumeClaim: { claimName: 'pvc-1' } }] },
              },
            },
          },
        } as OpenshiftVM,
      ];

      const { result } = renderHook(() => useOpenshiftStorageClasses(mockProvider, vms));

      expect(result.current.usedStorageClasses).toEqual(new Set(['pvc-storage']));
    });

    it('handles missing PVCs gracefully', () => {
      mockUseK8sWatchResource.mockReturnValue([[], true, undefined]);

      const vms = [
        {
          object: {
            metadata: { name: 'vm1', namespace: 'test-ns' },
            spec: {
              template: {
                spec: {
                  volumes: [{ persistentVolumeClaim: { claimName: 'non-existent' } }],
                },
              },
            },
          },
        } as OpenshiftVM,
      ];

      const { result } = renderHook(() => useOpenshiftStorageClasses(mockProvider, vms));

      expect(result.current.usedStorageClasses).toEqual(new Set());
    });
  });

  describe('DataVolume-backed volumes', () => {
    it('extracts storage classes from DataVolume-backed volumes', () => {
      const pvcs: IoK8sApiCoreV1PersistentVolumeClaim[] = [
        {
          metadata: { name: 'dv-1', namespace: 'test-ns' },
          spec: { storageClassName: 'dv-storage' },
        } as IoK8sApiCoreV1PersistentVolumeClaim,
      ];
      mockUseK8sWatchResource.mockReturnValue([pvcs, true, undefined]);

      const vms = [
        {
          object: {
            metadata: { name: 'vm1', namespace: 'test-ns' },
            spec: {
              template: { spec: { volumes: [{ dataVolume: { name: 'dv-1' } }] } },
            },
          },
        } as OpenshiftVM,
      ];

      const { result } = renderHook(() => useOpenshiftStorageClasses(mockProvider, vms));

      expect(result.current.usedStorageClasses).toEqual(new Set(['dv-storage']));
    });
  });

  describe('combined sources', () => {
    it('deduplicates storage classes from multiple volumes', () => {
      const pvcs: IoK8sApiCoreV1PersistentVolumeClaim[] = [
        {
          metadata: { name: 'pvc-1', namespace: 'test-ns' },
          spec: { storageClassName: 'shared-storage' },
        } as IoK8sApiCoreV1PersistentVolumeClaim,
        {
          metadata: { name: 'pvc-2', namespace: 'test-ns' },
          spec: { storageClassName: 'shared-storage' },
        } as IoK8sApiCoreV1PersistentVolumeClaim,
        {
          metadata: { name: 'dv-1', namespace: 'test-ns' },
          spec: { storageClassName: 'unique-storage' },
        } as IoK8sApiCoreV1PersistentVolumeClaim,
      ];
      mockUseK8sWatchResource.mockReturnValue([pvcs, true, undefined]);

      const vms = [
        {
          object: {
            metadata: { name: 'vm1', namespace: 'test-ns' },
            spec: {
              template: {
                spec: {
                  volumes: [
                    { persistentVolumeClaim: { claimName: 'pvc-1' } },
                    { persistentVolumeClaim: { claimName: 'pvc-2' } },
                    { dataVolume: { name: 'dv-1' } },
                  ],
                },
              },
            },
          },
        } as OpenshiftVM,
      ];

      const { result } = renderHook(() => useOpenshiftStorageClasses(mockProvider, vms));

      expect(result.current.usedStorageClasses).toEqual(
        new Set(['shared-storage', 'unique-storage']),
      );
    });
  });

  describe('loading and error states', () => {
    it('returns loading true when PVCs are not loaded', () => {
      const vms = [{ object: { metadata: { name: 'vm1', namespace: 'test-ns' } } } as OpenshiftVM];
      mockUseK8sWatchResource.mockReturnValue([[], false, undefined]);

      const { result } = renderHook(() => useOpenshiftStorageClasses(mockProvider, vms));

      expect(result.current.loading).toBe(true);
    });

    it('returns loading false when PVCs are loaded', () => {
      const vms = [{ object: { metadata: { name: 'vm1', namespace: 'test-ns' } } } as OpenshiftVM];
      mockUseK8sWatchResource.mockReturnValue([[], true, undefined]);

      const { result } = renderHook(() => useOpenshiftStorageClasses(mockProvider, vms));

      expect(result.current.loading).toBe(false);
    });

    it('returns error when PVC fetch fails', () => {
      const error = new Error('Failed to fetch PVCs');
      mockUseK8sWatchResource.mockReturnValue([[], false, error]);

      const vms = [
        {
          object: {
            metadata: { name: 'vm1', namespace: 'test-ns' },
            spec: {
              template: {
                spec: {
                  volumes: [{ persistentVolumeClaim: { claimName: 'pvc-1' } }],
                },
              },
            },
          },
        } as OpenshiftVM,
      ];

      const { result } = renderHook(() => useOpenshiftStorageClasses(mockProvider, vms));

      expect(result.current.error).toBe(error);
      expect(result.current.usedStorageClasses).toEqual(new Set());
    });
  });

  describe('multi-namespace handling', () => {
    it('extracts storage classes from VMs across multiple namespaces', () => {
      const pvcs: IoK8sApiCoreV1PersistentVolumeClaim[] = [
        {
          metadata: { name: 'pvc-1', namespace: 'namespace-1' },
          spec: { storageClassName: 'ns1-storage' },
        } as IoK8sApiCoreV1PersistentVolumeClaim,
        {
          metadata: { name: 'pvc-2', namespace: 'namespace-2' },
          spec: { storageClassName: 'ns2-storage' },
        } as IoK8sApiCoreV1PersistentVolumeClaim,
      ];
      mockUseK8sWatchResource.mockReturnValue([pvcs, true, undefined]);

      const vms = [
        {
          object: {
            metadata: { name: 'vm1', namespace: 'namespace-1' },
            spec: {
              template: {
                spec: { volumes: [{ persistentVolumeClaim: { claimName: 'pvc-1' } }] },
              },
            },
          },
        } as OpenshiftVM,
        {
          object: {
            metadata: { name: 'vm2', namespace: 'namespace-2' },
            spec: {
              template: {
                spec: { volumes: [{ persistentVolumeClaim: { claimName: 'pvc-2' } }] },
              },
            },
          },
        } as OpenshiftVM,
      ];

      const { result } = renderHook(() => useOpenshiftStorageClasses(mockProvider, vms));

      expect(result.current.usedStorageClasses).toEqual(new Set(['ns1-storage', 'ns2-storage']));
    });
  });
});
