import { act, renderHook } from '@testing-library/react-hooks';
import { createCancellableDebounce } from '@utils/debounce';

import { useScrollPositionPersistence } from '../useScrollPositionPersistence';

import { createDefaultOptions, createMockDebouncedFn, createMockScrollableElement } from './utils';

jest.mock('@utils/debounce', () => ({
  createCancellableDebounce: jest.fn(),
}));

const mockCreateCancellableDebounce = createCancellableDebounce as jest.MockedFunction<
  typeof createCancellableDebounce
>;

describe('useScrollPositionPersistence - Callback Ref Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createMockDebouncedFn(mockCreateCancellableDebounce);
  });

  it('returns a callback ref function', () => {
    const { result } = renderHook(() => useScrollPositionPersistence(createDefaultOptions()));

    expect(typeof result.current).toBe('function');
  });

  it('callback ref accepts DOM element', () => {
    const mockElement = createMockScrollableElement();
    const { result } = renderHook(() => useScrollPositionPersistence(createDefaultOptions()));

    expect(() => {
      act(() => {
        result.current(mockElement as unknown as HTMLDivElement);
      });
    }).not.toThrow();
  });

  it('callback ref accepts null (cleanup)', () => {
    const { result } = renderHook(() => useScrollPositionPersistence(createDefaultOptions()));

    expect(() => {
      act(() => {
        result.current(null);
      });
    }).not.toThrow();
  });
});
