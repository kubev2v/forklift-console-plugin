import { useMemo, useState } from 'react';
import { useSearchParams } from 'common/src/hooks/useSearchParams';

import { Field } from '../types';

import { GlobalFilters } from './types';

/**
 * @returns parsed object or undefined if exception was thrown
 */
const safeParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
};

/**
 * Init and maintain a set of filters on the search part of the URL.
 *
 *  1. filters are displayed in the URL as URL-encoded JSON array of strings. The use of intermediate JSON encoding ensures that we can encode arbitrary data.
 *  2. params in the URL are parsed only during initialization, afterwards they are a read-only side effect
 *  3. the single source of truth is the internal filter state maintained by the hook
 *
 * @param fields list of supported fields(read-only meta-data)
 * @param filterPrefix prefix for the field IDs to avoid name conflicts with other query params in the URL
 * @returns [selectedFilters, setSelectedFilters]
 */
export const useUrlFilters = ({
  fields,
  filterPrefix = '',
}: {
  fields: Field[];
  filterPrefix?: string;
}): [GlobalFilters, (filters: GlobalFilters) => void] => {
  const [searchParams, updateSearchParams] = useSearchParams();
  const [selectedFilters, setSelectedFilters] = useState(() =>
    Object.fromEntries(
      fields
        .map(({ id }) => ({
          id,
          // discard any corrupted filters i.e. partially copy-pasted
          params: safeParse(searchParams[`${filterPrefix}${id}`]),
        }))
        // discard filters with invalid structure (basic validation)
        // each filter should validate if values make sense (i.e. enum values in range)
        .filter(({ params }) => Array.isArray(params) && params.length)
        .map(({ id, params }) => [id, params]),
    ),
  );
  const setStateAndUrl = useMemo(
    () => (filters: GlobalFilters) => {
      setSelectedFilters(filters);
      updateSearchParams(
        Object.fromEntries(
          fields
            .map(({ id }) => ({ id, filters: filters[id] }))
            .map(({ id, filters }) => [
              id,
              Array.isArray(filters) && filters.length ? JSON.stringify(filters) : undefined,
            ]),
        ),
      );
    },
    [setSelectedFilters, updateSearchParams],
  );
  return [selectedFilters, setStateAndUrl];
};
