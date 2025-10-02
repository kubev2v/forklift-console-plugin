import type { OnPerPageSelect, OnSetPage } from '@patternfly/react-core';

export type PaginationState = {
  endIndex: number;
  page: number;
  perPage: number;
  startIndex: number;
};

type UsePaginationValues = {
  onPaginationChange: (newPagination: PaginationState) => void;
  pagination: PaginationState;
  onSetPage: OnSetPage;
  onPerPageSelect: OnPerPageSelect;
};

export type UsePagination = () => UsePaginationValues;
