type CancellableDebouncedFn<T extends (...args: Parameters<T>) => ReturnType<T>> = ((
  ...args: Parameters<T>
) => void) & {
  cancel: () => void;
};

export const createCancellableDebounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number,
): CancellableDebouncedFn<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };

  debouncedFn.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
};
