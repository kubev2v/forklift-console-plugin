import { useEffect, useState } from 'react';

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
  const [sortedData, setSortedData] = useState<T[]>([]);
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [finalFilteredData, setFinalFilteredData] = useState<T[]>([]);

  useEffect(() => {
    if (flatData && loaded && !error) {
      setSortedData([...flatData].sort(compareFn));
    }
  }, [flatData, compareFn, loaded, error]);

  useEffect(() => {
    if (sortedData && loaded && !error) {
      setFilteredData(sortedData.filter(metaMatcher));
    }
  }, [sortedData, metaMatcher, loaded, error]);

  useEffect(() => {
    if (!loaded || error) {
      return;
    }

    if (!filteredData || isEmpty(filteredData)) {
      setFinalFilteredData([]);
      return;
    }

    if (!postFilterData) {
      setFinalFilteredData(filteredData);
      return;
    }

    setFinalFilteredData(postFilterData(filteredData, selectedFilters, fields));
  }, [filteredData, postFilterData, selectedFilters, fields, loaded, error]);

  return {
    filteredData,
    finalFilteredData,
    sortedData,
  };
};
