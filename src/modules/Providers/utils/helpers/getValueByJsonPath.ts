/**
 * Retrieves the deep value of an object given a JSON path or a function.
 *
 * @param obj - The object to retrieve the value from.
 * @param pathOrFunction - The JSON path (dot notation) to the property, or a function that returns the desired value.
 * @returns The value at the given path, or the result of the function, or undefined if the path doesn't exist or the function returns undefined.
 */
export const getValueByJsonPath = <T>(
  obj: T,
  pathOrFunction: string | string[] | ((obj: T) => unknown),
): unknown => {
  if (typeof pathOrFunction === 'function') {
    return pathOrFunction(obj);
  }

  const pathParts = typeof pathOrFunction === 'string' ? pathOrFunction.split('.') : pathOrFunction;

  return pathParts.reduce((path, key) => path?.[key], obj);
};

export const jsonPathToPatch = (path: string | string[]) => {
  let pathParts = typeof path === 'string' ? path.split('.') : path;

  pathParts = pathParts.map((path) => path.replaceAll('/', '~1'));

  return `/${pathParts.join('/')}`;
};
