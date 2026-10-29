import type { ReactNode } from 'react';

import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import type { TdProps, ThProps } from '@patternfly/react-table';

import type { ColumnResizeConfig } from '../TableView/columnWidthUtils';
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

const withStickyCellClass = (className?: string): string =>
  className
    ? `${className} ${FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS}`
    : FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS;

type ForkliftHeaderProps = ThProps & { 'data-column-id'?: string };

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
  columnIndex: number;
  field: ResourceField;
  resizeConfig?: ColumnResizeConfig;
  setActiveSort: (sort: SortType) => void;
  visibleColumns: ResourceField[];
};

export const toDataViewColumn = ({
  actionScreenReaderText,
  activeSort,
  columnIndex,
  field,
  resizeConfig,
  setActiveSort,
  visibleColumns,
}: ToDataViewColumnArgs): DataViewTh => {
  const label = field.label ?? '';
  const headerProps: ForkliftHeaderProps = {
    'data-column-id': field.resourceFieldId ?? undefined,
    ...(field.isAction ? { ...getActionHeaderProps(), [DATA_ACTION_COLUMN_ATTR]: true } : {}),
    dataLabel: label || undefined,
    id: field.resourceFieldId ?? undefined,
    info: field.info,
    ...(resizeConfig
      ? {
          [DATA_COLUMN_WIDTH_FIXED_ATTR]: resizeConfig.savedWidth !== undefined,
          [DATA_DEFAULT_COLUMN_MIN_WIDTH_ATTR]: resizeConfig.minWidth,
          [DATA_DEFAULT_COLUMN_WEIGHT_ATTR]: field.defaultWidth?.weight ?? 1,
          [DATA_RESIZABLE_COLUMN_ATTR]: true,
          ...(resizeConfig.savedWidth === undefined
            ? {}
            : {
                style: {
                  minWidth: `${resizeConfig.savedWidth}px`,
                },
              }),
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
    resizableProps: resizeConfig
      ? {
          isResizable: true,
          minWidth: resizeConfig.minWidth,
          resizeButtonAriaLabel: resizeConfig.label,
          width: resizeConfig.savedWidth,
        }
      : undefined,
  };
};

export const getRenderedColumnCount = (
  columnCount: number,
  hasCustomColumnWidths: boolean,
): number => Math.max(columnCount - (hasCustomColumnWidths ? 0 : 1), 1);
