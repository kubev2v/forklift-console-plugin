import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';

import { OffloadPlugin } from '../../utils/types';
import { useOffloadPlugins } from '../useOffloadPlugins';
import { useStorageMapCrd } from '../useStorageMapCrd';

jest.mock('../useStorageMapCrd');

const mockUseStorageMapCrd = useStorageMapCrd as jest.MockedFunction<typeof useStorageMapCrd>;

const makeCrd = (pluginNames: string[]) =>
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
                              pluginNames.map((name) => [name, { type: 'object' }]),
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
  }) as unknown as ReturnType<typeof useStorageMapCrd>['crd'];

describe('useOffloadPlugins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('falls back to local constants while loading', () => {
    mockUseStorageMapCrd.mockReturnValue({
      crd: null,
      error: null,
      loading: true,
    });

    const { result } = renderHook(() => useOffloadPlugins());

    expect(result.current.offloadPlugins).toEqual(Object.values(OffloadPlugin));
  });

  it('uses CRD plugins without force-merging local constants', () => {
    mockUseStorageMapCrd.mockReturnValue({
      crd: makeCrd([OffloadPlugin.VSphereXcopyConfig]),
      error: null,
      loading: false,
    });

    const { result } = renderHook(() => useOffloadPlugins());

    expect(result.current.offloadPlugins).toEqual([OffloadPlugin.VSphereXcopyConfig]);
    expect(result.current.offloadPlugins).not.toContain(OffloadPlugin.CsiVolumeImport);
  });

  it('includes CSI when the CRD lists it', () => {
    mockUseStorageMapCrd.mockReturnValue({
      crd: makeCrd([OffloadPlugin.VSphereXcopyConfig, OffloadPlugin.CsiVolumeImport]),
      error: null,
      loading: false,
    });

    const { result } = renderHook(() => useOffloadPlugins());

    expect(result.current.offloadPlugins).toEqual([
      OffloadPlugin.VSphereXcopyConfig,
      OffloadPlugin.CsiVolumeImport,
    ]);
  });

  it('excludes unknown CRD plugins that the client does not support', () => {
    mockUseStorageMapCrd.mockReturnValue({
      crd: makeCrd([OffloadPlugin.VSphereXcopyConfig, 'futureUnsupportedPlugin']),
      error: null,
      loading: false,
    });

    const { result } = renderHook(() => useOffloadPlugins());

    expect(result.current.offloadPlugins).toEqual([OffloadPlugin.VSphereXcopyConfig]);
    expect(result.current.offloadPlugins).not.toContain('futureUnsupportedPlugin');
  });
});
