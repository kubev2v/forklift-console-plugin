type FieldsComparisonArgs<T> = {
  oldObject?: T;
  newObject?: T;
  fieldsToAvoidComparing: string[];
};

/**
 * Checks whether the specified fields have changed in two objects.
 *
 * @param params - An object containing the old object, new object, and fields to avoid comparing.
 * @returns A boolean indicating whether any of the specified fields have changed.
 */
export const hasObjectChangedInGivenFields = <T>(params: FieldsComparisonArgs<T>): boolean => {
  return !isEqual(params.newObject, params.oldObject, params.fieldsToAvoidComparing);
};

const isEqual = (obj1: unknown, obj2: unknown, fieldsToAvoidComparing: string[]): boolean => {
  const isFieldToCompare = (key: string) => !fieldsToAvoidComparing.includes(key);
  const isFieldChanged = (key: string, keys2: string[], fieldsToAvoidComparing: string[]) =>
    !keys2.includes(key) || !isEqual(obj1[key], obj2[key], fieldsToAvoidComparing);

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
    for (let i = 0; i < obj1.length; i += 1) {
      if (!isEqual(obj1[i], obj2[i], fieldsToAvoidComparing)) {
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
    if (isFieldToCompare(key) && isFieldChanged(key, keys2, fieldsToAvoidComparing)) {
      return false;
    }
  }

  return true;
};
