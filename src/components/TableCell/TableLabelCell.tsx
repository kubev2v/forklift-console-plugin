import type { FC, ReactNode } from 'react';

import { Label, type LabelProps } from '@patternfly/react-core';

import { TableCell, type TableCellProps } from './TableCell';

/**
 * A component that displays a table cell, with an optional label.
 *
 * @param {TableLabelCellProps} props - The props for the component.
 * @returns {ReactElement} The rendered TableLabelCell component.
 */
export const TableLabelCell: FC<TableLabelCellProps> = ({
  children,
  className,
  hasLabel = false,
  isWrap = false,
  label,
  labelColor = 'grey',
}) => {
  const labels = Array.isArray(label) ? label : [label];
  const labelColors = Array.isArray(labelColor) ? labelColor : labels.map(() => labelColor);

  return (
    <TableCell className={className} isWrap={isWrap}>
      {children}
      {hasLabel &&
        labels.map((_, i) => (
          <Label
            className="forklift-table__flex-cell-label"
            color={labelColors[i] as LabelProps['color']}
            isCompact
            key={i}
          >
            {labels[i]}
          </Label>
        ))}
    </TableCell>
  );
};

type Colors = 'blue' | 'cyan' | 'green' | 'orange' | 'purple' | 'red' | 'grey';
export type TableLabelCellProps = {
  hasLabel?: boolean;
  isWrap?: boolean;
  label?: ReactNode | ReactNode[];
  labelColor?: Colors | Colors[];
} & TableCellProps;
