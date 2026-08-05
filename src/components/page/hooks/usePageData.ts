import { useMemo } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { isEmpty } from '@utils/helpers';

type UsePageDataProps<T> = {
  flatData: T[];
  loaded: boolean;
  error: unknown;
  compareFn: (a: T, b: T) => number;
  metaMatcher: (item: T) => boolean;
  selectedFilters: Record<string, string[]>;
  fields: ResourceField[];
  postFilterData?: (
    data: T[],
    selectedFilters: Record<string, string[]>,
    fields: ResourceField[],
  ) => T[];
};

type UsePageDataResult<T> = {
  sortedData: T[];
  filteredData: T[];
  finalFilteredData: T[];
};

/**
 * Transforms data through 3 stages: sort → filter → postFilter.
 *
 * @param postFilterData - Optional custom filtering for complex scenarios that can't be
 *   handled by standard field matchers (e.g., cross-field comparisons).
 */
export const usePageData = <T>({
  compareFn,
  error,
  fields,
  flatData,
  loaded,
  metaMatcher,
  postFilterData,
  selectedFilters,
}: UsePageDataProps<T>): UsePageDataResult<T> => {
  const sortedData = useMemo(() => {
    if (flatData && loaded && !error) {
      return [...flatData].sort(compareFn);
    }
    return [];
  }, [flatData, compareFn, loaded, error]);

  const filteredData = useMemo(() => {
    if (sortedData && loaded && !error) {
      return sortedData.filter(metaMatcher);
    }
    return [];
  }, [sortedData, metaMatcher, loaded, error]);

  const finalFilteredData = useMemo(() => {
    if (!loaded || error) {
      return [];
    }

    if (!filteredData || isEmpty(filteredData)) {
      return [];
    }

    if (!postFilterData) {
      return filteredData;
    }

    return postFilterData(filteredData, selectedFilters, fields);
  }, [filteredData, postFilterData, selectedFilters, fields, loaded, error]);

  return {
    filteredData,
    finalFilteredData,
    sortedData,
  };
};
