export function saveToLocalStorage(key, value) {
  window?.localStorage?.setItem(key, value);
}

export function loadFromLocalStorage(key) {
  return window?.localStorage?.getItem(key);
}

export function removeFromLocalStorage(key) {
  window?.localStorage?.removeItem(key);
}
