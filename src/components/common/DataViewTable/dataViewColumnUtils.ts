import type { ReactNode } from 'react';

import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import type { DataViewThResizableProps } from '@patternfly/react-data-view/dist/esm/DataViewTh/DataViewTh';
import type { TdProps, ThProps } from '@patternfly/react-table';

import { ACTION_COLUMN_WIDTH_PX } from '../TableView/columnWidthConstants';
import { buildSort } from '../TableView/sort';
import type { SortType } from '../TableView/types';
import type { ResourceField } from '../utils/types';

export const SELECTION_COLUMN_WIDTH = '45px';

const actionColumnWidth = `${ACTION_COLUMN_WIDTH_PX}px`;

export const getActionHeaderProps = (): ThProps => ({
  hasLeftBorder: true,
  isStickyColumn: true,
  stickyMinWidth: actionColumnWidth,
  style: { width: actionColumnWidth },
});

export const getActionCellProps = (): TdProps => ({
  hasLeftBorder: true,
  isActionCell: true,
  isStickyColumn: true,
  stickyMinWidth: actionColumnWidth,
});

export const getSelectionHeaderProps = (screenReaderText: string): ThProps => ({
  isStickyColumn: true,
  screenReaderText,
  stickyLeftOffset: '0',
  stickyMinWidth: SELECTION_COLUMN_WIDTH,
  style: { maxWidth: SELECTION_COLUMN_WIDTH, width: SELECTION_COLUMN_WIDTH },
});

export const getExpandHeaderProps = (screenReaderText: string): ThProps => ({
  screenReaderText,
});

type ToDataViewColumnArgs = {
  activeSort: SortType;
  columnIndex: number;
  field: ResourceField;
  resizableProps?: DataViewThResizableProps;
  setActiveSort: (sort: SortType) => void;
  visibleColumns: ResourceField[];
};

export const toDataViewColumn = ({
  activeSort,
  columnIndex,
  field,
  resizableProps,
  setActiveSort,
  visibleColumns,
}: ToDataViewColumnArgs): DataViewTh => {
  const label = field.label ?? '';
  const headerProps: ThProps = {
    ...(field.isAction ? getActionHeaderProps() : {}),
    dataLabel: label || undefined,
    id: field.resourceFieldId ?? undefined,
    info: field.info,
    sort: field.sortable
      ? buildSort({
          activeSort,
          columnIndex,
          resourceFields: visibleColumns,
          setActiveSort,
        })
      : undefined,
  };

  return {
    cell: (label || null) as ReactNode,
    props: {
      ...headerProps,
      ...(field.testId ? { 'data-testid': field.testId } : {}),
      ...(label ? {} : { screenReaderText: 'Actions' }),
    } as ThProps,
    resizableProps,
  };
};

export const getBodyCellProps = (field: ResourceField): TdProps => ({
  ...(field.isAction ? getActionCellProps() : {}),
  dataLabel: field.label ?? field.resourceFieldId ?? undefined,
});
