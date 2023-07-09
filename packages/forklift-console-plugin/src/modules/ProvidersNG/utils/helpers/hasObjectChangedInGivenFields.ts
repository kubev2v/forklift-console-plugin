import { getValueByJsonPath } from './getValueByJsonPath';

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
  if (!params?.oldObject && !params?.newObject) {
    return false;
  }

  if (!params?.oldObject || !params?.newObject) {
    return true;
  }

  return params.fieldsToCompare.some(
    (field) =>
      getValueByJsonPath(params.oldObject, field) !== getValueByJsonPath(params.newObject, field),
  );
}
