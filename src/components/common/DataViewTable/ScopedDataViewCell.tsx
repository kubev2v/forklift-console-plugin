import type { FC, ReactElement } from 'react';

import type { RowProps } from '../TableView/types';

import { DataViewCellScopeProvider } from './DataViewCellScope';

type ScopedDataViewCellProps<T> = {
  columnId: string;
  RowComponent: FC<RowProps<T>>;
  rowProps: RowProps<T>;
};

const ScopedDataViewCell = <T,>({
  columnId,
  RowComponent,
  rowProps,
}: ScopedDataViewCellProps<T>): ReactElement => (
  <DataViewCellScopeProvider columnId={columnId}>
    <RowComponent {...rowProps} />
  </DataViewCellScopeProvider>
);

export default ScopedDataViewCell;
