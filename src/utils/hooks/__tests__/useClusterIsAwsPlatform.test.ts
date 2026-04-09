import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-hooks';

import { useClusterIsAwsPlatform } from '../useClusterIsAwsPlatform';

const mockUseK8sWatchResource = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: (...args: unknown[]) => mockUseK8sWatchResource(...args),
}));

describe('useClusterIsAwsPlatform', () => {
  it('should return true when platform type is AWS', () => {
    mockUseK8sWatchResource.mockReturnValue([
      { status: { platformStatus: { type: 'AWS' } } },
      true,
    ]);

    const { result } = renderHook(() => useClusterIsAwsPlatform());

    expect(result.current).toBe(true);
  });

  it('should return false when platform type is not AWS', () => {
    mockUseK8sWatchResource.mockReturnValue([
      { status: { platformStatus: { type: 'GCP' } } },
      true,
    ]);

    const { result } = renderHook(() => useClusterIsAwsPlatform());

    expect(result.current).toBe(false);
  });

  it('should return false when infrastructure is not loaded', () => {
    mockUseK8sWatchResource.mockReturnValue([{}, false]);

    const { result } = renderHook(() => useClusterIsAwsPlatform());

    expect(result.current).toBe(false);
  });

  it('should return false when platformStatus is missing', () => {
    mockUseK8sWatchResource.mockReturnValue([{ status: {} }, true]);

    const { result } = renderHook(() => useClusterIsAwsPlatform());

    expect(result.current).toBe(false);
  });
});
