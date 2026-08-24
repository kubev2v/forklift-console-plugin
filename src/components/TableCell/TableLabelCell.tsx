import type { FC, ReactNode } from 'react';

import { Label, type LabelProps } from '@patternfly/react-core';

import { TableCell, type TableCellProps } from './TableCell';

type Colors = 'blue' | 'cyan' | 'green' | 'orange' | 'purple' | 'red' | 'grey';

type LabelEntry = {
  color: Colors;
  key: string;
  labelItem: ReactNode;
};

const toLabelEntries = (labels: ReactNode[], labelColors: Colors[]): LabelEntry[] => {
  const seen = new Map<string, number>();

  return labels.map((labelItem, index) => {
    const base =
      typeof labelItem === 'string' || typeof labelItem === 'number' ? String(labelItem) : 'label';
    const occurrence = seen.get(base) ?? 0;
    seen.set(base, occurrence + 1);

    return {
      color: labelColors[index] ?? 'grey',
      key: occurrence === 0 ? base : `${base}__${occurrence}`,
      labelItem,
    };
  });
};

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
  const labelEntries = toLabelEntries(labels, labelColors);

  return (
    <TableCell className={className} isWrap={isWrap}>
      {children}
      {hasLabel &&
        labelEntries.map(({ color, key, labelItem }) => (
          <Label
            className="forklift-table__flex-cell-label"
            color={color as LabelProps['color']}
            isCompact
            key={key}
          >
            {labelItem}
          </Label>
        ))}
    </TableCell>
  );
};

export type TableLabelCellProps = {
  hasLabel?: boolean;
  isWrap?: boolean;
  label?: ReactNode | ReactNode[];
  labelColor?: Colors | Colors[];
} & TableCellProps;
