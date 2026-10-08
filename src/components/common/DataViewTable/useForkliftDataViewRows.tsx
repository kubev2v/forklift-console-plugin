import { type FC, useMemo } from 'react';

import type {
  DataViewTd,
  DataViewTr,
} from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';

import type { RowProps } from '../TableView/types';
import type { ResourceField } from '../utils/types';

import { getBodyCellProps } from './dataViewColumnUtils';
import ScopedDataViewCell from './ScopedDataViewCell';

type UseForkliftDataViewRowsArgs<T> = {
  entities: T[];
  getLeadingCells?: (entity: T, index: number) => DataViewTd[];
  namespace: string;
  RowComponent: FC<RowProps<T>>;
  visibleColumns: ResourceField[];
};

export const useForkliftDataViewRows = <T,>({
  entities,
  getLeadingCells,
  namespace,
  RowComponent,
  visibleColumns,
}: UseForkliftDataViewRowsArgs<T>): DataViewTr[] =>
  useMemo(
    () =>
      entities.map((resourceData, resourceIndex) => {
        const rowProps: RowProps<T> = {
          namespace,
          resourceData,
          resourceFields: visibleColumns,
          resourceIndex,
        };
        const dataCells: DataViewTd[] = visibleColumns.reduce<DataViewTd[]>((cells, field) => {
          const columnId = field.resourceFieldId;
          if (columnId) {
            cells.push({
              cell: (
                <ScopedDataViewCell
                  columnId={columnId}
                  RowComponent={RowComponent}
                  rowProps={rowProps}
                />
              ),
              props: getBodyCellProps(field),
            });
          }
          return cells;
        }, []);
        return [...(getLeadingCells?.(resourceData, resourceIndex) ?? []), ...dataCells];
      }),
    [entities, getLeadingCells, namespace, RowComponent, visibleColumns],
  );
