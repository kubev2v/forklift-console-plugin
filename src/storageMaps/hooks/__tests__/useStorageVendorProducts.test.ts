import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';

import { OffloadPlugin, StorageVendorProduct } from '../../utils/types';
import { useStorageMapCrd } from '../useStorageMapCrd';
import { useStorageVendorProducts } from '../useStorageVendorProducts';

jest.mock('../useStorageMapCrd');

const mockUseStorageMapCrd = useStorageMapCrd as jest.MockedFunction<typeof useStorageMapCrd>;

const makeCrd = (pluginEnums: Record<string, string[]>) =>
  ({
    spec: {
      versions: [
        {
          schema: {
            openAPIV3Schema: {
              properties: {
                spec: {
                  properties: {
                    map: {
                      items: {
                        properties: {
                          offloadPlugin: {
                            properties: Object.fromEntries(
                              Object.entries(pluginEnums).map(([plugin, enumValues]) => [
                                plugin,
                                {
                                  properties: {
                                    storageVendorProduct: { enum: enumValues },
                                  },
                                },
                              ]),
                            ),
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
  }) as ReturnType<typeof useStorageMapCrd>['crd'];

describe('useStorageVendorProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('falls back to primera3par for CSI while loading', () => {
    mockUseStorageMapCrd.mockReturnValue({
      crd: null,
      error: null,
      loading: true,
    });

    const { result } = renderHook(() => useStorageVendorProducts(OffloadPlugin.CsiVolumeImport));

    expect(result.current.storageVendorProducts).toEqual([StorageVendorProduct.Primera3Par]);
  });

  it('uses CRD CSI enum intersected with the write-path allowlist', () => {
    mockUseStorageMapCrd.mockReturnValue({
      crd: makeCrd({
        [OffloadPlugin.CsiVolumeImport]: ['primera3par', 'ontap'],
      }),
      error: null,
      loading: false,
    });

    const { result } = renderHook(() => useStorageVendorProducts(OffloadPlugin.CsiVolumeImport));

    expect(result.current.storageVendorProducts).toEqual([StorageVendorProduct.Primera3Par]);
  });

  it('falls back to CSI allowlist when CRD CSI enum is empty after filtering', () => {
    mockUseStorageMapCrd.mockReturnValue({
      crd: makeCrd({
        [OffloadPlugin.CsiVolumeImport]: ['ontap'],
      }),
      error: null,
      loading: false,
    });

    const { result } = renderHook(() => useStorageVendorProducts(OffloadPlugin.CsiVolumeImport));

    expect(result.current.storageVendorProducts).toEqual([StorageVendorProduct.Primera3Par]);
  });

  it('merges CRD products with constants for XCOPY', () => {
    mockUseStorageMapCrd.mockReturnValue({
      crd: makeCrd({
        [OffloadPlugin.VSphereXcopyConfig]: ['customVendor'],
      }),
      error: null,
      loading: false,
    });

    const { result } = renderHook(() => useStorageVendorProducts(OffloadPlugin.VSphereXcopyConfig));

    expect(result.current.storageVendorProducts).toContain('customVendor');
    expect(result.current.storageVendorProducts).toContain(StorageVendorProduct.Ontap);
  });

  it('returns the full fallback list for unknown or empty plugin', () => {
    mockUseStorageMapCrd.mockReturnValue({
      crd: null,
      error: null,
      loading: false,
    });

    const { result: emptyPlugin } = renderHook(() => useStorageVendorProducts(''));
    const { result: undefinedPlugin } = renderHook(() => useStorageVendorProducts());

    expect(emptyPlugin.current.storageVendorProducts).toContain(StorageVendorProduct.Ontap);
    expect(undefinedPlugin.current.storageVendorProducts).toContain(
      StorageVendorProduct.Primera3Par,
    );
  });
});
