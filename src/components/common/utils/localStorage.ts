export const saveToLocalStorage = (key: string, value: string): void => {
  window?.localStorage?.setItem(key, value);
};

export const loadFromLocalStorage = (key: string): string | null | undefined => {
  return window?.localStorage?.getItem(key);
};

export const removeFromLocalStorage = (key: string): void => {
  window?.localStorage?.removeItem(key);
};
