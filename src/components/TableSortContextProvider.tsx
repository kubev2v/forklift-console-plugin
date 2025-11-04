import type { FC, PropsWithChildren } from 'react';

import { TableSortContext } from '@components/TableSortContext';

import { useSort } from './common/TableView/sort';
import type { ResourceField, SortDirection } from './common/utils/types';

type TableSortContextProviderProps = PropsWithChildren & {
  fields: ResourceField[];
  defaultSort?: { resourceFieldId: string; direction: SortDirection };
};

export const TableSortContextProvider: FC<TableSortContextProviderProps> = ({
  children,
  defaultSort,
  fields,
}) => {
  const [activeSort, setActiveSort, compareFn] = useSort(fields, 'en', defaultSort);

  return (
    <TableSortContext.Provider value={{ activeSort, compareFn, setActiveSort }}>
      {children}
    </TableSortContext.Provider>
  );
};
