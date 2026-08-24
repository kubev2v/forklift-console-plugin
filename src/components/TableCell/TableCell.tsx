import { Children, type FC, type ReactNode } from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';

import './TableCells.style.css';

/**
 * A component that displays a table cell.
 *
 * @param {TableCellProps} props - The props for the component.
 * @returns {ReactElement} The rendered TableCell component.
 */
export const TableCell: FC<TableCellProps> = ({ children, className, isWrap = false }) => {
  const arrayChildren = Children.toArray(children);

  const cellClass = [isWrap ? undefined : 'forklift-table__cell', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      className={cellClass || undefined}
      display={{ default: 'inlineFlex' }}
      flexWrap={isWrap ? {} : { default: 'nowrap' }}
      spaceItems={{ default: 'spaceItemsXs' }}
    >
      {Children.map(arrayChildren, (child) => (
        <FlexItem flex={{ default: 'flexNone' }}>{child}</FlexItem>
      ))}
    </Flex>
  );
};

export type TableCellProps = {
  children?: ReactNode;
  className?: string;
  isWrap?: boolean;
};
