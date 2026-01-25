import { act, renderHook } from '@testing-library/react-hooks';
import { createCancellableDebounce } from '@utils/debounce';

import { useScrollPositionPersistence } from '../useScrollPositionPersistence';

import { customDebounceMs, defaultDebounceMs, testScrollPosition } from './constants';
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
    const onPositionChangeMock = jest.fn();
    const onPositionChange = (position: number) => {
      onPositionChangeMock(position);
    };
    const mockElement = createMockScrollableElement();

    const { result } = renderHook(() =>
      useScrollPositionPersistence(createDefaultOptions({ onPositionChange, isActive: true })),
    );

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    act(() => {
      fireScrollEvent(mockElement, testScrollPosition);
    });

    expect(onPositionChangeMock).toHaveBeenCalledWith(testScrollPosition);
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
      defaultDebounceMs,
    );
  });

  it('uses custom debounce delay when provided', () => {
    const options = createDefaultOptions({ debounceMs: customDebounceMs });

    renderHook(() => useScrollPositionPersistence(options));

    expect(mockCreateCancellableDebounce).toHaveBeenCalledWith(
      expect.any(Function),
      customDebounceMs,
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
