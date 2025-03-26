/**
 * Retrieves the deep value of an object given a JSON path or a function.
 *
 * @param obj - The object to retrieve the value from.
 * @param pathOrFunction - The JSON path (dot notation) to the property, or a function that returns the desired value.
 * @returns The value at the given path, or the result of the function, or undefined if the path doesn't exist or the function returns undefined.
 */
export function getValueByJsonPath<T>(
  obj: T,
  pathOrFunction: string | string[] | ((obj: T) => unknown),
): unknown {
  if (typeof pathOrFunction === 'function') {
    return pathOrFunction(obj);
  }

  let pathParts = [];
  if (typeof pathOrFunction === 'string') {
    pathParts = pathOrFunction.split('.');
  } else {
    pathParts = pathOrFunction;
  }

  return pathParts.reduce((o, key) => o?.[key], obj);
}

export function jsonPathToPatch(path: string | string[]) {
  let pathParts = [];

  if (typeof path === 'string') {
    pathParts = path.split('.');
  } else {
    pathParts = path;
  }

  pathParts = pathParts.map((o) => o.replaceAll('/', '~1'));

  return `/${pathParts.join('/')}`;
}
