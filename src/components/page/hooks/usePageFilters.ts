import { useCallback, useMemo } from 'react';

import {
  createMetaMatcher,
  defaultSupportedFilters,
  defaultValueMatchers,
} from '@components/common/FilterGroup/matchers';
import type {
  FilterRenderer,
  GlobalFilters,
  ValueMatcher,
} from '@components/common/FilterGroup/types';
import { useUrlFilters } from '@components/common/FilterGroup/useUrlFilters';
import type { UserSettings } from '@components/common/Page/types';
import type { ResourceField } from '@components/common/utils/types';

import { reduceValueFilters } from '../utils/reduceValueFilters';

type UsePageFiltersProps = {
  extraSupportedFilters?: Record<string, FilterRenderer>;
  extraSupportedMatchers?: ValueMatcher[];
  fieldsMetadata: ResourceField[];
  userSettings?: UserSettings;
};

/**
 * Manages filter state with URL sync and custom filter support.
 *
 * @param extraSupportedFilters - Custom filter UI components for special field types.
 *   Example: `{ dateField: (props) => <DateRangePicker {...props} /> }`
 *
 * @param extraSupportedMatchers - Custom matching logic for filtering.
 *   Example: `[{ filterType: 'dateRange', matchValue: (value, filterValues) => ... }]`
 */
type UsePageFiltersResult = {
  clearAllFilters: () => void;
  excludeFromClearFiltersIds: string[];
  metaMatcher: ReturnType<typeof createMetaMatcher>;
  selectedFilters: GlobalFilters;
  setSelectedFilters: (filters: GlobalFilters) => void;
  supportedFilters: Record<string, FilterRenderer>;
  supportedMatchers: ValueMatcher<string>[];
};

export const usePageFilters = ({
  extraSupportedFilters,
  extraSupportedMatchers,
  fieldsMetadata,
  userSettings,
}: UsePageFiltersProps): UsePageFiltersResult => {
  const [selectedFilters, setSelectedFilters] = useUrlFilters({
    fields: fieldsMetadata,
    userSettings,
  });

  const supportedMatchers = useMemo(
    () =>
      extraSupportedMatchers
        ? reduceValueFilters(extraSupportedMatchers, defaultValueMatchers)
        : defaultValueMatchers,
    [extraSupportedMatchers],
  );

  const supportedFilters = useMemo(
    () =>
      extraSupportedFilters
        ? { ...defaultSupportedFilters, ...extraSupportedFilters }
        : defaultSupportedFilters,
    [extraSupportedFilters],
  );

  const metaMatcher = useMemo(
    () => createMetaMatcher(selectedFilters, fieldsMetadata, supportedMatchers),
    [selectedFilters, fieldsMetadata, supportedMatchers],
  );

  const excludeFromClearFiltersIds = useMemo(
    () =>
      fieldsMetadata
        .filter((field) => field.filter?.excludeFromClearFilters)
        .map((field) => field.resourceFieldId)
        .filter((id): id is string => Boolean(id) && typeof id === 'string'),
    [fieldsMetadata],
  );

  const selectedFiltersAfterClearAll = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(selectedFilters).filter(([key]) => excludeFromClearFiltersIds.includes(key)),
      ),
    [excludeFromClearFiltersIds, selectedFilters],
  );

  const clearAllFilters = useCallback(() => {
    setSelectedFilters(selectedFiltersAfterClearAll);
  }, [selectedFiltersAfterClearAll, setSelectedFilters]);

  return {
    clearAllFilters,
    excludeFromClearFiltersIds,
    metaMatcher,
    selectedFilters,
    setSelectedFilters,
    supportedFilters,
    supportedMatchers,
  };
};
