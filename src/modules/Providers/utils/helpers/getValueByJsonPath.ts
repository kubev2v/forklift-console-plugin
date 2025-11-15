import type { OpenApiJsonPath } from '@components/common/utils/types';

/**
 * Retrieves the deep value of an object given a JSON path or a function.
 *
 * @param obj - The object to retrieve the value from.
 * @param pathOrFunction - The JSON path (dot notation) to the property, or a function that returns the desired value.
 * @returns The value at the given path, or the result of the function, or undefined if the path doesn't exist or the function returns undefined.
 */
export const getValueByJsonPath = (obj: unknown, pathOrFunction: OpenApiJsonPath): string => {
  if (typeof pathOrFunction === 'function') {
    return pathOrFunction(obj);
  }

  const pathParts = typeof pathOrFunction === 'string' ? pathOrFunction.split('.') : pathOrFunction;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
  return pathParts.reduce((path: any, key: string) => path?.[key], obj) as string;
};

/**
 * Converts a JSON path in dot notation to a JSON Patch path.
 *
 * @param obj - The object (not used in this function but kept for consistency with getValueByJsonPath).
 * @param pathOrFunction - The JSON path (dot notation) or a function that returns the desired path.
 * @returns The JSON Patch path as a string.
 */
export const openApiJsonPathToPatch = (obj: unknown, pathOrFunction: OpenApiJsonPath) => {
  if (typeof pathOrFunction === 'function') {
    return pathOrFunction(obj);
  }

  let pathParts = typeof pathOrFunction === 'string' ? pathOrFunction.split('.') : pathOrFunction;

  pathParts = pathParts.map((pathPart) => pathPart.replaceAll('/', '~1'));

  return `/${pathParts.join('/')}`;
};
