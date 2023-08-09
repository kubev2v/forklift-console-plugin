import React, { ReactNode } from 'react';

import { Label } from '@patternfly/react-core';

import { TableCell, TableCellProps } from './TableCell';

/**
 * A component that displays a table cell, with an optional label.
 *
 * @param {TableLabelCellProps} props - The props for the component.
 * @returns {ReactElement} The rendered TableLabelCell component.
 */
export const TableLabelCell: React.FC<TableLabelCellProps> = ({
  children,
  isWrap = false,
  hasLabel = false,
  label,
  labelColor = 'grey',
}) => {
  return (
    <TableCell isWrap={isWrap}>
      {children}
      {hasLabel && (
        <Label isCompact color={labelColor} className="forklift-table__flex-cell-label">
          {label}
        </Label>
      )}
    </TableCell>
  );
};

export interface TableLabelCellProps extends TableCellProps {
  hasLabel?: boolean;
  label?: ReactNode;
  labelColor?: 'blue' | 'cyan' | 'green' | 'orange' | 'purple' | 'red' | 'grey';
  isWrap?: boolean;
}
