type FieldsComparisonArgs<T> = {
  oldObject?: T;
  newObject?: T;
  fieldsToCompare: string[];
};

/**
 * Checks whether the specified fields have changed in two objects.
 *
 * @param params - An object containing the old object, new object, and fields to be compared.
 * @returns A boolean indicating whether any of the specified fields have changed.
 */
export function hasObjectChangedInGivenFields<T>(params: FieldsComparisonArgs<T>): boolean {
  return !isEqual(params.newObject, params.oldObject);
}

function isEqual(obj1: unknown, obj2: unknown): boolean {
  // Check the object types
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || !obj1 || !obj2) {
    return obj1 === obj2;
  }

  // If they are the same object, return true
  if (obj1 === obj2) {
    return true;
  }

  // If one object and one array
  if (
    (Array.isArray(obj1) && !Array.isArray(obj2)) ||
    (!Array.isArray(obj1) && Array.isArray(obj2))
  ) {
    return false;
  }

  // Compare arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!isEqual(obj1[i], obj2[i])) {
        return false;
      }
    }
    return true;
  }

  // Compare object keys
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check each key in obj1 to see if they are equal
  for (const key of keys1) {
    if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
