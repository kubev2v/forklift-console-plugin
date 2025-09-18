import { useCallback, useState } from 'react';

import type { OnPerPageSelect, OnSetPage } from '@patternfly/react-core';

import { paginationInitialState } from './utils/constants';
import type { PaginationState, UsePagination } from './utils/types';

const usePagination: UsePagination = () => {
  const [pagination, setPagination] = useState<PaginationState>(paginationInitialState);

  const onPaginationChange = useCallback((newPagination: PaginationState) => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      ...newPagination,
    }));
  }, []);

  const onSetPage: OnSetPage = useCallback(
    (_, newPage) => {
      onPaginationChange({ ...pagination, page: newPage });
    },
    [onPaginationChange, pagination],
  );

  const onPerPageSelect: OnPerPageSelect = useCallback(
    (_, newPerPage) => {
      onPaginationChange({ ...pagination, page: 1, perPage: newPerPage });
    },
    [onPaginationChange, pagination],
  );

  return { onPaginationChange, onPerPageSelect, onSetPage, pagination };
};

export default usePagination;
