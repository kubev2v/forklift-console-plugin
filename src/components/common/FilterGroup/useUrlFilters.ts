import { useMemo, useState } from 'react';

import { useDeepMemo } from '@utils/hooks/useDeepMemo';

import { useSearchParams } from '../hooks/useSearchParams';
import type { UserSettings } from '../Page/types';
import type { ResourceField } from '../utils/types';

import type { GlobalFilters } from './types';

/**
 * Safely parses a JSON string.
 * @param {string} str - The JSON string to parse.
 * @returns {unknown} - The parsed JSON object or null if parsing fails.
 */
const safeParse = (str: string): unknown => {
  try {
    return JSON.parse(str);
  } catch (_e) {
    return undefined;
  }
};

/**
 * Filters and validates the search parameters.
 * @param {Array} fields - The fields containing resourceFieldId.
 * @param {Object} searchParams - The search parameters to filter and validate.
 * @returns {GlobalFilters} - An object with valid filters.
 */
const getValidFilters = (
  fields: { resourceFieldId: string | null }[],
  searchParams: Record<string, string>,
): GlobalFilters => {
  return fields.reduce<GlobalFilters>((acc, nextField) => {
    const { resourceFieldId } = nextField;
    const params = safeParse(searchParams[`${resourceFieldId}`]);

    // Valid filter values are arrays
    if (resourceFieldId && Array.isArray(params) && params.length) {
      acc[resourceFieldId] = params;
    }
    return acc;
  }, {});
};

/**
 * Converts filters to search parameters.
 * @param {Array} fields - The fields containing resourceFieldId.
 * @param {Object} filters - The filters to convert.
 * @returns {Object} - The search parameters.
 */
const convertFiltersToSearchParams = (
  fields: { resourceFieldId: string | null }[],
  filters: GlobalFilters,
): Record<string, string> => {
  const searchParams = fields
    .reduce<{ filters: string[]; resourceFieldId: string }[]>((acc, nextField) => {
      if (nextField.resourceFieldId) {
        acc.push({
          filters: filters[nextField.resourceFieldId],
          resourceFieldId: nextField.resourceFieldId,
        });
      }
      return acc;
    }, [])
    .map(({ filters: resourceFilters, resourceFieldId }) => [
      resourceFieldId,
      Array.isArray(resourceFilters) && resourceFilters.length
        ? JSON.stringify(resourceFilters)
        : undefined,
    ]);

  return Object.fromEntries(searchParams) as Record<string, string>;
};

/**
 * Sets the state and updates the URL search parameters.
 * @param {Function} setSelectedFilters - The function to set selected filters.
 * @param {Function} updateSearchParams - The function to update search parameters.
 * @param {Function} updateUserSettings - The function to update user settings.
 * @param {Array} persistentFieldIds - The persistent field IDs.
 * @param fields
 * @returns {Function} - The function to set state and update URL.
 */
const createSetStateAndUrl = (
  setSelectedFilters: (filters: GlobalFilters) => void,
  updateSearchParams: (params: Record<string, string>) => void,
  updateUserSettings: ((filters: GlobalFilters) => void) | undefined,
  persistentFieldIds: string[],
  fields: { resourceFieldId: string | null }[],
) => {
  return (filters: Record<string, string[]>) => {
    if (updateUserSettings) {
      const persistentFilters: GlobalFilters = Object.fromEntries(
        Object.entries(filters || {}).filter(([key]) => persistentFieldIds.includes(key)),
      );
      updateUserSettings(persistentFilters);
    }
    setSelectedFilters(filters);
    updateSearchParams(convertFiltersToSearchParams(fields, filters));
  };
};

const getIdsFromFields = (fields: ResourceField[]) =>
  fields.reduce<string[]>((acc, nextField) => {
    if (nextField?.isPersistent && nextField.resourceFieldId) {
      acc.push(nextField.resourceFieldId);
    }
    return acc;
  }, []);

const getInitialFilters = (
  fields: ResourceField[],
  searchParams: Record<string, string>,
  userSettings?: UserSettings,
) => {
  const initialFieldIds = getIdsFromFields(fields);

  const persistentFilters = Object.fromEntries(
    Object.entries(userSettings?.filters?.data ?? {}).filter(([key]) =>
      initialFieldIds.includes(key),
    ),
  );

  return {
    ...persistentFilters,
    ...getValidFilters(fields, searchParams),
  } as GlobalFilters;
};

/**
 * Init and maintain a set of filters on the search part of the URL.
 *
 *  1. filters are displayed in the URL as URL-encoded JSON array of strings. The use of intermediate JSON encoding ensures that we can encode arbitrary data.
 *  2. params in the URL are parsed only during initialization, afterwards they are a read-only side effect
 *  3. the single source of truth is the internal filter state maintained by the hook
 *
 * @param fields list of supported fields(read-only meta-data)
 * @returns [selectedFilters, setSelectedFilters]
 */
export const useUrlFilters = ({
  fields: initialFields,
  userSettings,
}: {
  fields: ResourceField[];
  userSettings?: UserSettings;
}): [GlobalFilters, (filters: GlobalFilters) => void] => {
  const fields = useDeepMemo(initialFields);
  const [searchParams, setSearchParams] = useSearchParams();

  const persistentFieldIds = useMemo(() => getIdsFromFields(fields), [fields]);

  const [selectedFilters, setSelectedFilters] = useState(
    getInitialFilters(fields, searchParams, userSettings),
  );
  const updateUserSettings = userSettings?.filters?.save;
  const updateSelectedFilters = useDeepMemo(setSelectedFilters);
  const updateSearchParams = useDeepMemo(setSearchParams);

  const setStateAndUrl = useMemo(
    () =>
      createSetStateAndUrl(
        updateSelectedFilters,
        updateSearchParams,
        updateUserSettings,
        persistentFieldIds,
        fields,
      ),
    [updateSelectedFilters, updateSearchParams, updateUserSettings, persistentFieldIds, fields],
  );

  return [selectedFilters, setStateAndUrl];
};
