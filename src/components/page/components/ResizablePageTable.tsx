import type { FC, ReactElement, ReactNode } from 'react';

import ForkliftDataViewTable from '@components/common/DataViewTable/ForkliftDataViewTable';
import ForkliftHybridDataViewTable from '@components/common/DataViewTable/ForkliftHybridDataViewTable';
import type { RowProps, SortType } from '@components/common/TableView/types';
import type { ResourceField } from '@components/common/utils/types';

import { useDataViewSelection } from '../hooks/useDataViewSelection';

type ResizablePageTableProps<T> = {
  activeSort: SortType;
  'aria-label': string;
  entities: T[];
  expandedIds?: string[];
  namespace: string;
  placeholder?: ReactNode;
  RowComponent: FC<RowProps<T>>;
  setActiveSort: (sort: SortType) => void;
  toId?: (item: T) => string;
  visibleColumns: ResourceField[];
};

const ResizablePageTable = <T,>({
  activeSort,
  'aria-label': ariaLabel,
  entities,
  expandedIds,
  namespace,
  placeholder,
  RowComponent,
  setActiveSort,
  toId,
  visibleColumns,
}: ResizablePageTableProps<T>): ReactElement => {
  const { getLeadingCells, leadingColumns, useHybridBody } = useDataViewSelection<T>();

  if (useHybridBody) {
    return (
      <ForkliftHybridDataViewTable
        activeSort={activeSort}
        aria-label={ariaLabel}
        entities={entities}
        expandedIds={expandedIds}
        leadingColumns={leadingColumns}
        namespace={namespace}
        placeholder={placeholder}
        RowComponent={RowComponent}
        setActiveSort={setActiveSort}
        toId={toId}
        visibleColumns={visibleColumns}
      />
    );
  }

  return (
    <ForkliftDataViewTable
      activeSort={activeSort}
      aria-label={ariaLabel}
      entities={entities}
      getLeadingCells={getLeadingCells}
      leadingColumns={leadingColumns}
      namespace={namespace}
      placeholder={placeholder}
      RowComponent={RowComponent}
      setActiveSort={setActiveSort}
      visibleColumns={visibleColumns}
    />
  );
};

export default ResizablePageTable;
