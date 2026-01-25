import { Children, type FC, type ReactNode } from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';

import './TableCells.style.css';

/**
 * A component that displays a table cell.
 *
 * @param {TableCellProps} props - The props for the component.
 * @returns {ReactElement} The rendered TableCell component.
 */
export const TableCell: FC<TableCellProps> = ({ children, isWrap = false }) => {
  const arrayChildren = Children.toArray(children);

  return (
    <Flex
      spaceItems={{ default: 'spaceItemsXs' }}
      display={{ default: 'inlineFlex' }}
      flexWrap={isWrap ? {} : { default: 'nowrap' }}
      alignItems={{ default: 'alignItemsCenter' }}
      className={isWrap ? undefined : 'forklift-table__cell'}
    >
      {Children.map(arrayChildren, (child, index) => (
        <FlexItem key={index} flex={{ default: 'flexNone' }}>
          {child}
        </FlexItem>
      ))}
    </Flex>
  );
};

export type TableCellProps = {
  children?: ReactNode;
  isWrap?: boolean;
};
