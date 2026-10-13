import type { ReactNode } from 'react';

import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import type { DataViewThResizableProps } from '@patternfly/react-data-view/dist/esm/DataViewTh/DataViewTh';
import type { TdProps, ThProps } from '@patternfly/react-table';

import { buildSort } from '../TableView/sort';
import type { SortType } from '../TableView/types';
import type { ResourceField } from '../utils/types';

import { FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS } from './forkliftDataViewTableClass';
import { prepareColumnResize } from './prepareColumnResize';

export const SELECTION_COLUMN_WIDTH = '45px';

const withStickyCellClass = (className?: string): string =>
  className
    ? `${className} ${FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS}`
    : FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS;

export const getColumnWidthSpacerProps = (): TdProps &
  ThProps & { 'data-column-width-spacer': true } => ({
  'aria-hidden': true,
  'data-column-width-spacer': true,
  role: 'presentation',
});

const getActionHeaderProps = (): ThProps => ({
  className: withStickyCellClass(),
  hasLeftBorder: true,
  isStickyColumn: true,
  stickyMinWidth: '0',
});

export const getActionCellProps = (): TdProps => ({
  className: withStickyCellClass(),
  hasLeftBorder: true,
  isActionCell: true,
  isStickyColumn: true,
  stickyMinWidth: '0',
});

export const getSelectionHeaderProps = (screenReaderText: string): ThProps => ({
  className: withStickyCellClass(),
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
  actionScreenReaderText: string;
  activeSort: SortType;
  columnIndex: number;
  field: ResourceField;
  resizableProps?: DataViewThResizableProps;
  setActiveSort: (sort: SortType) => void;
  visibleColumns: ResourceField[];
};

export const toDataViewColumn = ({
  actionScreenReaderText,
  activeSort,
  columnIndex,
  field,
  resizableProps,
  setActiveSort,
  visibleColumns,
}: ToDataViewColumnArgs): DataViewTh => {
  const label = field.label ?? '';
  const headerProps: ThProps = {
    ...(field.isAction ? { ...getActionHeaderProps(), 'data-action-column': true } : {}),
    dataLabel: label || undefined,
    id: field.resourceFieldId ?? undefined,
    info: field.info,
    ...(resizableProps?.isResizable
      ? {
          'data-column-width-fixed': resizableProps.width !== undefined,
          'data-resizable-column': true,
          onKeyDownCapture: (event): void => {
            prepareColumnResize(event, resizableProps.resizeButtonAriaLabel);
          },
          onMouseDownCapture: (event): void => {
            prepareColumnResize(event, resizableProps.resizeButtonAriaLabel);
          },
          onTouchStartCapture: (event): void => {
            prepareColumnResize(event, resizableProps.resizeButtonAriaLabel);
          },
        }
      : {}),
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
      ...(label ? {} : { screenReaderText: actionScreenReaderText }),
    } as ThProps,
    resizableProps,
  };
};

export const getBodyCellProps = (field: ResourceField): TdProps => ({
  ...(field.isAction ? getActionCellProps() : { modifier: 'truncate' as const }),
  dataLabel: field.label ?? field.resourceFieldId ?? undefined,
});
