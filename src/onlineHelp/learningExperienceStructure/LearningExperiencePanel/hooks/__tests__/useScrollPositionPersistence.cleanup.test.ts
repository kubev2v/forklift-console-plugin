import { act, renderHook } from '@testing-library/react-hooks';
import { createCancellableDebounce } from '@utils/debounce';

import { useScrollPositionPersistence } from '../useScrollPositionPersistence';

import { TEST_SAVED_POSITION, TEST_SCROLL_POSITION, TEST_USER_SCROLL_POSITION } from './constants';
import {
  createDefaultOptions,
  createMockDebouncedFn,
  createMockScrollableElement,
  fireScrollEvent,
} from './utils';

jest.mock('@utils/debounce', () => ({
  createCancellableDebounce: jest.fn(),
}));

const mockCreateCancellableDebounce = createCancellableDebounce as jest.MockedFunction<
  typeof createCancellableDebounce
>;

describe('useScrollPositionPersistence - Cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createMockDebouncedFn(mockCreateCancellableDebounce);
  });

  it('removes scroll listener on unmount', () => {
    const mockElement = createMockScrollableElement();

    const { result, unmount } = renderHook(() =>
      useScrollPositionPersistence(createDefaultOptions()),
    );

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    unmount();

    expect(mockElement.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('removes scroll listener when element changes', () => {
    const mockElement1 = createMockScrollableElement();
    const mockElement2 = createMockScrollableElement();

    const { result } = renderHook(() => useScrollPositionPersistence(createDefaultOptions()));

    act(() => {
      result.current(mockElement1 as unknown as HTMLDivElement);
    });

    act(() => {
      result.current(mockElement2 as unknown as HTMLDivElement);
    });

    expect(mockElement1.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('cancels pending debounced calls on cleanup', () => {
    const mockElement = createMockScrollableElement();

    const { result, unmount } = renderHook(() =>
      useScrollPositionPersistence(createDefaultOptions()),
    );

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    act(() => {
      fireScrollEvent(mockElement, TEST_SCROLL_POSITION);
    });

    const cancelFn = mockCreateCancellableDebounce.mock.results[0]?.value?.cancel;

    unmount();

    expect(cancelFn).toHaveBeenCalled();
  });
});

describe('useScrollPositionPersistence - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createMockDebouncedFn(mockCreateCancellableDebounce);
  });

  it('handles rapid scroll events', () => {
    const onPositionChange = jest.fn();
    const mockElement = createMockScrollableElement();

    const { result } = renderHook(() =>
      useScrollPositionPersistence(createDefaultOptions({ onPositionChange })),
    );

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    act(() => {
      fireScrollEvent(mockElement, TEST_USER_SCROLL_POSITION);
      fireScrollEvent(mockElement, TEST_SCROLL_POSITION);
      fireScrollEvent(mockElement, TEST_SAVED_POSITION);
    });

    expect(onPositionChange).toHaveBeenCalled();
  });

  it('handles element reattachment', () => {
    const mockElement1 = createMockScrollableElement();
    const mockElement2 = createMockScrollableElement();

    const { result } = renderHook(() =>
      useScrollPositionPersistence(createDefaultOptions({ savedPosition: TEST_SAVED_POSITION })),
    );

    act(() => {
      result.current(mockElement1 as unknown as HTMLDivElement);
    });

    expect(mockElement1.scrollTop).toBe(TEST_SAVED_POSITION);

    act(() => {
      result.current(null);
    });

    act(() => {
      result.current(mockElement2 as unknown as HTMLDivElement);
    });

    expect(mockElement2.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('onPositionChange updates are reflected in scroll handler', () => {
    const onPositionChange1 = jest.fn();
    const onPositionChange2 = jest.fn();
    const mockElement = createMockScrollableElement();

    const { result, rerender } = renderHook(
      ({ onPositionChange }) =>
        useScrollPositionPersistence(createDefaultOptions({ onPositionChange })),
      { initialProps: { onPositionChange: onPositionChange1 } },
    );

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    rerender({ onPositionChange: onPositionChange2 });

    act(() => {
      fireScrollEvent(mockElement, TEST_SCROLL_POSITION);
    });

    expect(onPositionChange2).toHaveBeenCalledWith(TEST_SCROLL_POSITION);
  });
});
