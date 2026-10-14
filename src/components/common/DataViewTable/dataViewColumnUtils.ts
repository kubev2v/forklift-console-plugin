import type { ReactNode } from 'react';

import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import type { DataViewThResizableProps } from '@patternfly/react-data-view/dist/esm/DataViewTh/DataViewTh';
import type { TdProps, ThProps } from '@patternfly/react-table';

import { getMinWidthForField } from '../TableView/columnWidthUtils';
import { buildSort } from '../TableView/sort';
import type { SortType } from '../TableView/types';
import type { ResourceField } from '../utils/types';

import {
  COLUMN_WIDTH_SPACER_ARIA_HIDDEN,
  COLUMN_WIDTH_SPACER_ROLE,
  DATA_ACTION_COLUMN_ATTR,
  DATA_COLUMN_WIDTH_FIXED_ATTR,
  DATA_COLUMN_WIDTH_SPACER_ATTR,
  DATA_DEFAULT_COLUMN_MIN_WIDTH_ATTR,
  DATA_DEFAULT_COLUMN_WEIGHT_ATTR,
  DATA_RESIZABLE_COLUMN_ATTR,
} from './dataViewTableConstants';
import { FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS } from './forkliftDataViewTableClass';
import { prepareColumnResize } from './prepareColumnResize';

const withStickyCellClass = (className?: string): string =>
  className
    ? `${className} ${FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS}`
    : FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS;

export const getColumnWidthSpacerProps = (): TdProps &
  ThProps & { [DATA_COLUMN_WIDTH_SPACER_ATTR]: true } => ({
  'aria-hidden': COLUMN_WIDTH_SPACER_ARIA_HIDDEN,
  [DATA_COLUMN_WIDTH_SPACER_ATTR]: true,
  role: COLUMN_WIDTH_SPACER_ROLE,
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

type ToDataViewColumnArgs = {
  actionScreenReaderText: string;
  activeSort: SortType;
  captureColumnWidths?: (widths: Record<string, number>) => void;
  columnIndex: number;
  field: ResourceField;
  resizableProps?: DataViewThResizableProps;
  setActiveSort: (sort: SortType) => void;
  visibleColumns: ResourceField[];
};

export const toDataViewColumn = ({
  actionScreenReaderText,
  activeSort,
  captureColumnWidths,
  columnIndex,
  field,
  resizableProps,
  setActiveSort,
  visibleColumns,
}: ToDataViewColumnArgs): DataViewTh => {
  const label = field.label ?? '';
  const headerProps: ThProps = {
    ...(field.isAction ? { ...getActionHeaderProps(), [DATA_ACTION_COLUMN_ATTR]: true } : {}),
    dataLabel: label || undefined,
    id: field.resourceFieldId ?? undefined,
    info: field.info,
    ...(resizableProps?.isResizable
      ? {
          [DATA_COLUMN_WIDTH_FIXED_ATTR]: resizableProps.width !== undefined,
          [DATA_DEFAULT_COLUMN_MIN_WIDTH_ATTR]: getMinWidthForField(field),
          [DATA_DEFAULT_COLUMN_WEIGHT_ATTR]: field.defaultWidth?.weight ?? 1,
          [DATA_RESIZABLE_COLUMN_ATTR]: true,
          onKeyDownCapture: (event): void => {
            prepareColumnResize(event, resizableProps.resizeButtonAriaLabel, captureColumnWidths);
          },
          onMouseDownCapture: (event): void => {
            prepareColumnResize(event, resizableProps.resizeButtonAriaLabel, captureColumnWidths);
          },
          onTouchStartCapture: (event): void => {
            prepareColumnResize(event, resizableProps.resizeButtonAriaLabel, captureColumnWidths);
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

export const getRenderedColumnCount = (
  columnCount: number,
  hasCustomColumnWidths: boolean,
): number => Math.max(columnCount - (hasCustomColumnWidths ? 0 : 1), 1);

export const getBodyCellProps = (field: ResourceField): TdProps => ({
  ...(field.isAction ? getActionCellProps() : { modifier: 'truncate' as const }),
  dataLabel: field.label ?? field.resourceFieldId ?? undefined,
});
