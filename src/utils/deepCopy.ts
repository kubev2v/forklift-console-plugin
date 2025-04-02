/**
 * Creates a deep copy of the given object.
 * @param {T} obj - The object to be deep copied.
 * @returns {T} A deep copy of the input object.
 * @template T
 */
export const deepCopy = <T>(obj: T): T => {
  if (obj === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(obj));
};
