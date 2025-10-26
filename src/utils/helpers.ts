export const isEmpty = (value: object | unknown[] | string | undefined | null): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0;
  }

  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
};

/**
 * Returns a Set of values that appear more than once in an array.
 */
export const getDuplicateValues = <T>(items: T[], getValue: (item: T) => string): Set<string> => {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    const value = getValue(item);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return new Set(
    Array.from(counts.entries())
      .filter(([_, count]) => count > 1)
      .map(([value]) => value),
  );
};
