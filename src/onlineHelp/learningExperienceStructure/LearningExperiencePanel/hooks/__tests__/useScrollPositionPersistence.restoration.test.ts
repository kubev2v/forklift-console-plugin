import { act, renderHook } from '@testing-library/react-hooks';
import { createCancellableDebounce } from '@utils/debounce';

import { useScrollPositionPersistence } from '../useScrollPositionPersistence';

import { testSavedPosition, testScrollPosition, testUserScrollPosition } from './constants';
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
    const options = createDefaultOptions({ savedPosition: testSavedPosition, isActive: true });
    const mockElement = createMockScrollableElement(0);

    const { result } = renderHook(() => useScrollPositionPersistence(options));

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.scrollTop).toBe(testSavedPosition);
  });

  it('does not restore when savedPosition is 0', () => {
    const options = createDefaultOptions({ savedPosition: 0, isActive: true });
    const mockElement = createMockScrollableElement(testScrollPosition);

    const { result } = renderHook(() => useScrollPositionPersistence(options));

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.scrollTop).toBe(testScrollPosition);
  });

  it('does not restore when isActive is false', () => {
    const options = createDefaultOptions({ savedPosition: testSavedPosition, isActive: false });
    const mockElement = createMockScrollableElement(0);

    const { result } = renderHook(() => useScrollPositionPersistence(options));

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.scrollTop).toBe(0);
  });

  it('restores only once per activation', () => {
    const options = createDefaultOptions({ savedPosition: testSavedPosition });
    const mockElement = createMockScrollableElement();

    const { result, rerender } = renderHook(() => useScrollPositionPersistence(options));

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.scrollTop).toBe(testSavedPosition);

    mockElement.scrollTop = testUserScrollPosition;
    rerender();

    expect(mockElement.scrollTop).toBe(testUserScrollPosition);
  });

  it('resets restoration flag when isActive becomes false', () => {
    const mockElement = createMockScrollableElement();
    let isActive = true;

    const { result, rerender } = renderHook(() =>
      useScrollPositionPersistence(
        createDefaultOptions({ savedPosition: testSavedPosition, isActive }),
      ),
    );

    act(() => {
      result.current(mockElement as unknown as HTMLDivElement);
    });

    expect(mockElement.scrollTop).toBe(testSavedPosition);

    mockElement.scrollTop = testUserScrollPosition;

    isActive = false;
    rerender();

    isActive = true;
    rerender();

    expect(mockElement.scrollTop).toBe(testSavedPosition);
  });
});
