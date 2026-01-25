import type { createCancellableDebounce } from '@utils/debounce';

import { defaultDebounceMs } from './constants';

type MockScrollableElement = {
  scrollTop: number;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
};

type HookOptions = {
  savedPosition: number;
  onPositionChange: (position: number) => void;
  isActive?: boolean;
  debounceMs?: number;
};

export const createMockScrollableElement = (initialScrollTop = 0): MockScrollableElement => ({
  scrollTop: initialScrollTop,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});

export const createDefaultOptions = (overrides: Partial<HookOptions> = {}): HookOptions => ({
  savedPosition: 0,
  onPositionChange: () => {
    /* default noop */
  },
  isActive: true,
  debounceMs: defaultDebounceMs,
  ...overrides,
});

export const fireScrollEvent = (element: MockScrollableElement, scrollTop: number): void => {
  element.scrollTop = scrollTop;

  const addEventListenerCalls = element.addEventListener.mock.calls;
  const scrollListenerCall = addEventListenerCalls.find(
    ([eventType]: [string]) => eventType === 'scroll',
  );

  if (scrollListenerCall) {
    const handler = scrollListenerCall[1] as (event: Event) => void;
    handler({ currentTarget: element } as unknown as Event);
  }
};

export const createMockDebouncedFn = (
  mockCreateCancellableDebounce: jest.MockedFunction<typeof createCancellableDebounce>,
) => {
  let capturedFn: ((position: number) => void) | null = null;

  mockCreateCancellableDebounce.mockImplementation((fn) => {
    capturedFn = fn as (position: number) => void;
    const debouncedFn = jest.fn((...args: unknown[]) => {
      capturedFn?.(...(args as [number]));
    });
    (debouncedFn as unknown as { cancel: jest.Mock }).cancel = jest.fn();
    return debouncedFn as unknown as ReturnType<typeof createCancellableDebounce>;
  });

  return {
    getCapturedFn: () => capturedFn,
    getCancel: () => {
      const [lastCall] = mockCreateCancellableDebounce.mock.results;
      return lastCall?.value?.cancel as jest.Mock | undefined;
    },
  };
};
