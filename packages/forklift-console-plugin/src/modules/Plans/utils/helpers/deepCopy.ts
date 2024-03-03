/**
 * Creates a deep copy of the given object.
 * @param {T} obj - The object to be deep copied.
 * @returns {T} A deep copy of the input object.
 * @template T
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
