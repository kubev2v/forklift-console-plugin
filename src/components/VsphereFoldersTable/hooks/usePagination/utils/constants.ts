import type { PaginationState } from './types';

export const paginationInitialState: PaginationState = {
  endIndex: 10,
  page: 1,
  perPage: 10,
  startIndex: 0,
};
