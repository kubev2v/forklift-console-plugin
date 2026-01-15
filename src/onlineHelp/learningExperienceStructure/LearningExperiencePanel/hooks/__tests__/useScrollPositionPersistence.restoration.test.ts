import { act, renderHook } from '@testing-library/react-hooks';
import { createCancellableDebounce } from '@utils/debounce';

import { useScrollPositionPersistence } from '../useScrollPositionPersistence';

import { TEST_SAVED_POSITION, TEST_SCROLL_POSITION, TEST_USER_SCROLL_POSITION } from './constants';
import { createDefaultOptions, createMockDebouncedFn, createMockScrollableElement } from './utils';

jest.mock('@utils/debounce', () => ({
  createCancellableDebounce: jest.fn(),
}));

const mockCreateCancellableDebounce = createCancellableDebounce as jest.MockedFunction<
  typeof createCancellableDebounce
>;

describe('useScrollPositionPersistence - Scroll Position Restoration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createMockDebouncedFn(mockCreateCancellableDebounce);
  });

  it('restores scroll position when savedPosition > 0', () => {
    const options = createDefaultOptions({ savedPosition: TEST_SAVED_POSITION, isActive: true });
    const mockElement = createMockScrollableElement(0);

    const { result } = renderHook(() => useScrollPositionPersistence(options));

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.scrollTop).toBe(TEST_SAVED_POSITION);
  });

  it('does not restore when savedPosition is 0', () => {
    const options = createDefaultOptions({ savedPosition: 0, isActive: true });
    const mockElement = createMockScrollableElement(TEST_SCROLL_POSITION);

    const { result } = renderHook(() => useScrollPositionPersistence(options));

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.scrollTop).toBe(TEST_SCROLL_POSITION);
  });

  it('does not restore when isActive is false', () => {
    const options = createDefaultOptions({ savedPosition: TEST_SAVED_POSITION, isActive: false });
    const mockElement = createMockScrollableElement(0);

    const { result } = renderHook(() => useScrollPositionPersistence(options));

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.scrollTop).toBe(0);
  });

  it('restores only once per activation', () => {
    const options = createDefaultOptions({ savedPosition: TEST_SAVED_POSITION });
    const mockElement = createMockScrollableElement();

    const { result, rerender } = renderHook(() => useScrollPositionPersistence(options));

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.scrollTop).toBe(TEST_SAVED_POSITION);

    mockElement.scrollTop = TEST_USER_SCROLL_POSITION;
    rerender();

    expect(mockElement.scrollTop).toBe(TEST_USER_SCROLL_POSITION);
  });

  it('resets restoration flag when isActive becomes false', () => {
    const mockElement = createMockScrollableElement();
    let isActive = true;

    const { result, rerender } = renderHook(() =>
      useScrollPositionPersistence(
        createDefaultOptions({ savedPosition: TEST_SAVED_POSITION, isActive }),
      ),
    );

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.scrollTop).toBe(TEST_SAVED_POSITION);

    mockElement.scrollTop = TEST_USER_SCROLL_POSITION;

    isActive = false;
    rerender();

    isActive = true;
    rerender();

    expect(mockElement.scrollTop).toBe(TEST_SAVED_POSITION);
  });
});
