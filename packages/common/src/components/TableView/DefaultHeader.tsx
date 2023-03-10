import React from 'react';

import { Th } from '@patternfly/react-table';

import { buildSort } from './sort';
import { TableViewHeaderProps } from './types';

export const DefaultHeader = ({
  visibleColumns,
  setActiveSort,
  activeSort,
}: TableViewHeaderProps) => {
  return (
    <>
      {visibleColumns.map(({ resourceFieldID, label, sortable }, columnIndex) => (
        <Th
          key={resourceFieldID}
          sort={
            sortable &&
            buildSort({
              activeSort,
              columnIndex,
              resourceFields: visibleColumns,
              setActiveSort,
            })
          }
        >
          {label}
        </Th>
      ))}
    </>
  );
};
