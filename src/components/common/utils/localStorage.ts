export const saveToLocalStorage = (key: string, value: string) => {
  window?.localStorage?.setItem(key, value);
};

export const loadFromLocalStorage = (key: string) => {
  return window?.localStorage?.getItem(key);
};

export const removeFromLocalStorage = (key: string) => {
  window?.localStorage?.removeItem(key);
};
