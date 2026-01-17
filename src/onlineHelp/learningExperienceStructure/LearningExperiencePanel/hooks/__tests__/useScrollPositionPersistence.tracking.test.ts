import { act, renderHook } from '@testing-library/react-hooks';
import { createCancellableDebounce } from '@utils/debounce';

import { useScrollPositionPersistence } from '../useScrollPositionPersistence';

import { CUSTOM_DEBOUNCE_MS, DEFAULT_DEBOUNCE_MS, TEST_SCROLL_POSITION } from './constants';
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

describe('useScrollPositionPersistence - Scroll Event Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createMockDebouncedFn(mockCreateCancellableDebounce);
  });

  it('attaches scroll listener when active with element', () => {
    const mockElement = createMockScrollableElement();

    const { result } = renderHook(() =>
      useScrollPositionPersistence(createDefaultOptions({ isActive: true })),
    );

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('calls onPositionChange with scroll position', () => {
    const onPositionChange = jest.fn();
    const mockElement = createMockScrollableElement();

    const { result } = renderHook(() =>
      useScrollPositionPersistence(createDefaultOptions({ onPositionChange, isActive: true })),
    );

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    act(() => {
      fireScrollEvent(mockElement, TEST_SCROLL_POSITION);
    });

    expect(onPositionChange).toHaveBeenCalledWith(TEST_SCROLL_POSITION);
  });

  it('does not attach listener when isActive is false', () => {
    const mockElement = createMockScrollableElement();

    const { result } = renderHook(() =>
      useScrollPositionPersistence(createDefaultOptions({ isActive: false })),
    );

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.addEventListener).not.toHaveBeenCalled();
  });

  it('does not attach listener when element is null', () => {
    renderHook(() => useScrollPositionPersistence(createDefaultOptions({ isActive: true })));

    // No element attached - hook should not throw
  });
});

describe('useScrollPositionPersistence - Debounce Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createMockDebouncedFn(mockCreateCancellableDebounce);
  });

  it('uses default debounce delay of 100ms', () => {
    const options = createDefaultOptions();

    renderHook(() =>
      useScrollPositionPersistence({
        savedPosition: options.savedPosition,
        onPositionChange: options.onPositionChange,
        isActive: options.isActive,
      }),
    );

    expect(mockCreateCancellableDebounce).toHaveBeenCalledWith(
      expect.any(Function),
      DEFAULT_DEBOUNCE_MS,
    );
  });

  it('uses custom debounce delay when provided', () => {
    const options = createDefaultOptions({ debounceMs: CUSTOM_DEBOUNCE_MS });

    renderHook(() => useScrollPositionPersistence(options));

    expect(mockCreateCancellableDebounce).toHaveBeenCalledWith(
      expect.any(Function),
      CUSTOM_DEBOUNCE_MS,
    );
  });

  it('cancels debounced call on cleanup', () => {
    const mockElement = createMockScrollableElement();

    const { result, unmount } = renderHook(() =>
      useScrollPositionPersistence(createDefaultOptions()),
    );

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    const cancelFn = mockCreateCancellableDebounce.mock.results[0]?.value?.cancel;

    unmount();

    expect(cancelFn).toHaveBeenCalled();
  });
});
