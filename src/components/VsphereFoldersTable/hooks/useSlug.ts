import { useCallback, useRef } from 'react';

export const useSlug = () => {
  const cacheRef = useRef(new Map<string, string>());
  return useCallback((value: string) => {
    const cached = cacheRef.current.get(value);
    if (cached) return cached;
    const slugged = value
      .toLowerCase()
      .replace(/\s+/gu, '_')
      .replace(/[^\w-]/gu, '');
    cacheRef.current.set(value, slugged);
    return slugged;
  }, []);
};
