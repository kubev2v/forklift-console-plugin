export const isEmpty = (value: object | unknown[] | undefined | null): boolean =>
  Array.isArray(value) ? value.length === 0 : Object.keys(value ?? {}).length === 0;
