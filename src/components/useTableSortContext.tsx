import { useContext } from 'react';

import { TableSortContext } from '@components/TableSortContext';

export const useTableSortContext = () => useContext(TableSortContext);
