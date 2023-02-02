import { useMemo, useState } from 'react';

import { PaginationSettings } from './types';

// counting from one seems recommneded - zero breaks some cases
const DEFAULT_FIRST_PAGE = 1;
// first option in the default "per page" dropdown
export const DEFAULT_PER_PAGE = 10;

export interface PaginationHookProps<T> {
  pagination?: number | 'on' | 'off';
  filteredData: T[];
  flattenData: T[];
  userSettings?: PaginationSettings;
}

export interface PaginationHookResult<T> {
  pageData: T[];
  showPagination: boolean;
  itemsPerPage: number;
  currentPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
}

export function usePagination<T>({
  pagination,
  filteredData,
  flattenData,
  userSettings,
}: PaginationHookProps<T>): PaginationHookResult<T> {
  const {
    perPage: defaultPerPage = DEFAULT_PER_PAGE,
    save: savePerPage = () => undefined,
    clear: clearSavedPerPage = () => undefined,
  } = userSettings || {};
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [page, setPage] = useState(DEFAULT_FIRST_PAGE);

  const lastPage = Math.ceil(filteredData.length / perPage);
  const effectivePage = Math.max(DEFAULT_FIRST_PAGE, Math.min(page, lastPage));
  const showPagination =
    pagination === 'on' || (typeof pagination === 'number' && flattenData.length > pagination);

  const pageData = useMemo(
    () => filteredData.slice((effectivePage - 1) * perPage, effectivePage * perPage),
    [filteredData, effectivePage, perPage],
  );

  const setPerPageInStateAndSettings = useMemo(
    () => (perPage: number) => {
      setPerPage(perPage);
      if (perPage !== DEFAULT_PER_PAGE) {
        savePerPage(perPage);
      } else {
        clearSavedPerPage();
      }
    },
    [setPerPage, savePerPage, clearSavedPerPage],
  );

  return {
    pageData,
    showPagination,
    itemsPerPage: perPage,
    currentPage: effectivePage,
    setPage,
    setPerPage: setPerPageInStateAndSettings,
  };
}
