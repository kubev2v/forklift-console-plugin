import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';

import { useClusterIsAzurePlatform } from '../useClusterIsAzurePlatform';

const mockUseK8sWatchResource = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: (...args: unknown[]): unknown => mockUseK8sWatchResource(...args),
}));

describe('useClusterIsAzurePlatform', () => {
  afterEach(() => {
    process.env.FORCE_SHOW_AZURE_PROVIDER = 'false';
  });

  it('should return true when the platform type is Azure', () => {
    mockUseK8sWatchResource.mockReturnValue([
      { status: { platformStatus: { type: 'Azure' } } },
      true,
    ]);

    const { result } = renderHook(() => useClusterIsAzurePlatform());

    expect(result.current).toEqual({ isAzurePlatform: true, loaded: true });
  });

  it('should return false when the platform type is not Azure', () => {
    mockUseK8sWatchResource.mockReturnValue([
      { status: { platformStatus: { type: 'AWS' } } },
      true,
    ]);

    const { result } = renderHook(() => useClusterIsAzurePlatform());

    expect(result.current).toEqual({ isAzurePlatform: false, loaded: true });
  });

  it('should return not loaded when infrastructure is not loaded', () => {
    mockUseK8sWatchResource.mockReturnValue([{}, false]);

    const { result } = renderHook(() => useClusterIsAzurePlatform());

    expect(result.current).toEqual({ isAzurePlatform: false, loaded: false });
  });

  it('should return false when platformStatus is missing', () => {
    mockUseK8sWatchResource.mockReturnValue([{ status: {} }, true]);

    const { result } = renderHook(() => useClusterIsAzurePlatform());

    expect(result.current).toEqual({ isAzurePlatform: false, loaded: true });
  });

  it('should return true on any platform when the development override is enabled', () => {
    process.env.FORCE_SHOW_AZURE_PROVIDER = 'true';
    mockUseK8sWatchResource.mockReturnValue([
      { status: { platformStatus: { type: 'AWS' } } },
      true,
    ]);

    const { result } = renderHook(() => useClusterIsAzurePlatform());

    expect(result.current.isAzurePlatform).toBe(true);
  });
});
