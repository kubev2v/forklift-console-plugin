import React, { Children, ReactNode } from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';

import './TableCells.style.css';

/**
 * A component that displays a table cell.
 *
 * @param {TableCellProps} props - The props for the component.
 * @returns {ReactElement} The rendered TableCell component.
 */
export const TableCell: React.FC<TableCellProps> = ({ children, isWrap = false }) => {
  const arrayChildren = Children.toArray(children);

  return (
    <span className="forklift-table__flex-cell" data-testid="table-cell">
      <Flex
        spaceItems={{ default: 'spaceItemsXs' }}
        display={{ default: 'inlineFlex' }}
        flexWrap={!isWrap ? { default: 'nowrap' } : {}}
      >
        {Children.map(arrayChildren, (child) => (
          <FlexItem>{child}</FlexItem>
        ))}
      </Flex>
    </span>
  );
};

export interface TableCellProps {
  children?: ReactNode;
  isWrap?: boolean;
}
