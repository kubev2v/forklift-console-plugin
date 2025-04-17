import type { OpenApiJsonPath } from 'src/modules/Providers/modals/EditModal/types';

export const safeBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return Boolean(value);
};

// Normalize jsonPath to always be an array of strings
const normalizePath = (obj: object, path: OpenApiJsonPath): string[] => {
  if (typeof path === 'function') {
    const resolvedPath = path(obj);
    if (typeof resolvedPath === 'string') return resolvedPath.split('.');
    if (Array.isArray(resolvedPath)) return resolvedPath;
    throw new Error('Function-based jsonPath must return a string or string[]');
  }

  return typeof path === 'string' ? path.split('.') : path;
};

export const setObjectValueByPath = (obj: object, path: OpenApiJsonPath, value: unknown) => {
  const keys = normalizePath(obj, path);

  const parentKeys = keys.slice(0, -1);
  const lastKey = keys[keys.length - 1];

  const parent = parentKeys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);

  parent[lastKey] = value;
};

export const unsetObjectValueByPath = (obj: object, path: OpenApiJsonPath) => {
  const keys = normalizePath(obj, path);
  const lastKey = keys.pop();
  if (!lastKey) return;

  const parent = keys.reduce((current, key) => current?.[key], obj);

  if (parent && lastKey in parent) {
    delete parent[lastKey];
  }
};

export const isEmpty = (value: object | unknown[] | undefined | null): boolean =>
  Array.isArray(value) ? value.length === 0 : Object.keys(value ?? {}).length === 0;
