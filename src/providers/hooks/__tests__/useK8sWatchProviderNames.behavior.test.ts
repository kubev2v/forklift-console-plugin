import { renderHook } from '@testing-library/react-hooks';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import { useK8sWatchProviderNames } from '../useK8sWatchProviderNames';

jest.mock('@utils/hooks/useK8sWatchResource', () => ({
  useK8sWatchResource: jest.fn(),
}));

const mockWatch = useK8sWatchResource as jest.MockedFunction<typeof useK8sWatchResource>;

describe('useK8sWatchProviderNames - behavior', () => {
  beforeEach(() => jest.clearAllMocks());

  it('stays unloaded until providers are loaded', () => {
    mockWatch.mockReturnValue([[], false, null] as never);
    const { result } = renderHook(() => useK8sWatchProviderNames({ namespace: 'ns' }));
    expect(result.current).toEqual([undefined, false, null]);
  });

  it('returns provider names when loaded', () => {
    mockWatch.mockReturnValue([
      [{ metadata: { name: 'alpha' } }, { metadata: { name: 'beta' } }, { metadata: {} }],
      true,
      null,
    ] as never);

    const { result } = renderHook(() => useK8sWatchProviderNames({ namespace: 'ns' }));
    expect(result.current[0]).toEqual(['alpha', 'beta']);
    expect(result.current[1]).toBe(true);
    expect(result.current[2]).toBeNull();
  });

  it('returns load error and wraps non-Error values', () => {
    const err = new Error('forbidden');
    mockWatch.mockReturnValue([[], true, err] as never);
    expect(renderHook(() => useK8sWatchProviderNames({ namespace: 'ns' })).result.current[2]).toBe(
      err,
    );

    mockWatch.mockReturnValue([[], true, 'boom'] as never);
    const { result } = renderHook(() => useK8sWatchProviderNames({ namespace: 'ns' }));
    expect(result.current[2]).toBeInstanceOf(Error);
    expect(result.current[2]?.message).toBe('boom');
  });
});
