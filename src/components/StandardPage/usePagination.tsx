import { useMemo, useState } from 'react';

// counting from one seems recommneded - zero breaks some cases
const DEFAULT_FIRST_PAGE = 1;
// first option in the default "per page" dropdown
export const DEFAULT_PER_PAGE = 10;

export interface PaginationHookProps<T> {
  pagination?: number | 'on' | 'off';
  filteredData: T[];
  flattenData: T[];
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
}: PaginationHookProps<T>): PaginationHookResult<T> {
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [page, setPage] = useState(DEFAULT_FIRST_PAGE);

  const lastPage = Math.ceil(filteredData.length / perPage);
  const effectivePage = Math.max(DEFAULT_FIRST_PAGE, Math.min(page, lastPage));
  const showPagination =
    pagination === 'on' || (typeof pagination === 'number' && flattenData.length > pagination);

  const pageData = useMemo(
    () => filteredData.slice((effectivePage - 1) * perPage, effectivePage * perPage),
    [filteredData, effectivePage, perPage],
  );

  return {
    pageData,
    showPagination,
    itemsPerPage: perPage,
    currentPage: effectivePage,
    setPage,
    setPerPage,
  };
}
