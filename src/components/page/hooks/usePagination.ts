import { type MutableRefObject, useCallback, useMemo, useState } from 'react';

import type { PaginationSettings } from '@components/common/Page/types';
import {
  DEFAULT_PER_PAGE,
  usePagination as usePerPagePagination,
} from '@components/common/Page/usePagination';
import type { OnPerPageSelect, OnSetPage } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { INITIAL_PAGE } from '../utils/constants';

type UsePaginationProps<T> = {
  initialPage: number;
  pageRef: MutableRefObject<number>;
  finalFilteredData: T[];
  selectedFilters: Record<string, string[]>;
  sortedDataLength: number;
  pagination?: number | 'on' | 'off';
  userSettings?: PaginationSettings;
};

type UsePaginationResult<T> = {
  page: number;
  setPage: (page: number) => void;
  itemsPerPage: number;
  setPerPage: (perPage: number) => void;
  pageData: T[];
  showPagination: boolean;
  onSetPage: OnSetPage;
  onPerPageSelect: OnPerPageSelect;
};

/**
 * Manages pagination with smart page adjustment when filters change.
 *
 * @param pageRef - Ref to current page, allows parent to read/update pagination state.
 * @param initialPage - Starting page number, used for initialization and sync.
 */
export const usePagination = <T>({
  finalFilteredData,
  initialPage,
  pageRef,
  pagination = DEFAULT_PER_PAGE,
  selectedFilters,
  sortedDataLength,
  userSettings,
}: UsePaginationProps<T>): UsePaginationResult<T> => {
  const [page, setPageState] = useState(() =>
    pageRef.current === initialPage ? initialPage : pageRef.current,
  );
  const [prevInitialPage, setPrevInitialPage] = useState(initialPage);

  if (initialPage !== prevInitialPage) {
    setPrevInitialPage(initialPage);
    if (pageRef.current !== initialPage) {
      setPageState(pageRef.current);
    }
  }

  const setPage = useCallback(
    (newPage: number) => {
      pageRef.current = newPage;
      setPageState(newPage);
    },
    [pageRef],
  );

  const itemsPerPageValue =
    typeof pagination === 'number' ? pagination : (userSettings?.perPage ?? DEFAULT_PER_PAGE);
  const hasActiveFilters = Object.values(selectedFilters).some((filter) => !isEmpty(filter));
  const maxPage = Math.ceil(finalFilteredData.length / itemsPerPageValue);
  const fallbackPage = maxPage > 0 ? maxPage : INITIAL_PAGE;
  const clampedPage = hasActiveFilters && page > maxPage ? fallbackPage : page;

  if (clampedPage !== page) {
    pageRef.current = clampedPage;
    setPageState(clampedPage);
  }

  const showPagination = useMemo(
    () => pagination === 'on' || (typeof pagination === 'number' && sortedDataLength > pagination),
    [pagination, sortedDataLength],
  );

  const { itemsPerPage, setPerPage } = usePerPagePagination({
    filteredDataLength: finalFilteredData.length,
    userSettings,
  });

  const pageData = useMemo(
    () => finalFilteredData.slice((clampedPage - 1) * itemsPerPage, clampedPage * itemsPerPage),
    [finalFilteredData, clampedPage, itemsPerPage],
  );

  const onSetPage = useCallback<OnSetPage>(
    (_event, newPage) => {
      setPage(newPage);
    },
    [setPage],
  );

  const onPerPageSelect = useCallback<OnPerPageSelect>(
    (_event, perPage, newPage) => {
      setPerPage(perPage);
      setPage(newPage);
    },
    [setPerPage, setPage],
  );

  return {
    itemsPerPage,
    onPerPageSelect,
    onSetPage,
    page: clampedPage,
    pageData,
    setPage,
    setPerPage,
    showPagination,
  };
};
