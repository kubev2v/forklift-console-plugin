import { useContext } from 'react';

import { TableSortContext, type TableSortContextProps } from '@components/TableSortContext';

export const useTableSortContext = (): TableSortContextProps => useContext(TableSortContext);
