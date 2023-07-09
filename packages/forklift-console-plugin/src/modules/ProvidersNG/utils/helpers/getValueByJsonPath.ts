/**
 * Retrieves the deep value of an object given a JSON path.
 *
 * @param obj - The object to retrieve the value from.
 * @param path - The JSON path (dot notation) to the property.
 * @returns The value at the given path, or undefined if the path doesn't exist.
 */
export function getValueByJsonPath<T>(obj: T, path: string | string[]): unknown {
  let pathParts = [];

  if (typeof path === 'string') {
    pathParts = path.split('.');
  } else {
    pathParts = path;
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
