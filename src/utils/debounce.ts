type CancellableDebouncedFn<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void;
  flush: () => void;
};

export const createCancellableDebounce = <TArgs extends unknown[]>(
  func: (...args: TArgs) => unknown,
  wait: number,
): CancellableDebouncedFn<TArgs> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingArgs: TArgs | null = null;

  const flush = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    const args = pendingArgs;
    pendingArgs = null;
    if (args !== null) {
      func(...args);
    }
  };

  const debouncedFn = (...args: TArgs): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    pendingArgs = args;
    timeoutId = setTimeout(flush, wait);
  };

  debouncedFn.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingArgs = null;
  };
  debouncedFn.flush = flush;

  return debouncedFn;
};
