import React, { ReactNode } from 'react';

import { TableLabelCell, TableLabelCellProps } from './TableLabelCell';

/**
 * A component that displays a table cell, with an optional icon.
 *
 * @param {TableIconCellProps} props - The props for the component.
 * @returns {ReactElement} The rendered TableLinkCell component.
 */
export const TableIconCell: React.FC<TableIconCellProps> = ({
  children,
  icon,
  hasLabel = false,
  label,
  labelColor = 'grey',
}) => {
  return (
    <TableLabelCell hasLabel={hasLabel} label={label} labelColor={labelColor}>
      {icon}
      {children}
    </TableLabelCell>
  );
};

export interface TableIconCellProps extends TableLabelCellProps {
  icon?: ReactNode;
}
