import type { TdProps, ThProps } from '@patternfly/react-table';

import {
  DATA_CONTROL_COLUMN_ATTR,
  EXPANSION_COLUMN_WIDTH,
  SELECTION_COLUMN_WIDTH,
} from './dataViewTableConstants';
import { FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS } from './forkliftDataViewTableClass';

type ControlColumnProps = {
  [DATA_CONTROL_COLUMN_ATTR]: 'expand' | 'select';
};

const getControlColumnProps = (
  column: ControlColumnProps[typeof DATA_CONTROL_COLUMN_ATTR],
  hasExpansion = false,
): TdProps & ThProps & ControlColumnProps => ({
  className: FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS,
  [DATA_CONTROL_COLUMN_ATTR]: column,
  isStickyColumn: true,
  stickyLeftOffset: column === 'select' && hasExpansion ? EXPANSION_COLUMN_WIDTH : '0',
  stickyMinWidth: column === 'expand' ? EXPANSION_COLUMN_WIDTH : SELECTION_COLUMN_WIDTH,
});

export const getSelectionHeaderProps = (
  screenReaderText: string,
  hasExpansion = false,
): ThProps & ControlColumnProps => ({
  ...getControlColumnProps('select', hasExpansion),
  screenReaderText,
});

export const getExpandHeaderProps = (screenReaderText: string): ThProps & ControlColumnProps => ({
  ...getControlColumnProps('expand'),
  screenReaderText,
});

export const getSelectionCellProps = (hasExpansion = false): TdProps & ControlColumnProps =>
  getControlColumnProps('select', hasExpansion);

export const getExpandCellProps = (): TdProps & ControlColumnProps =>
  getControlColumnProps('expand');
