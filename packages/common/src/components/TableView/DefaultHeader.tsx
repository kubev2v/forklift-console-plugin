import React from 'react';

import { Th } from '@patternfly/react-table';

import { buildSort } from './sort';
import { TableViewHeaderProps } from './types';

export const DefaultHeader = ({
  visibleColumns,
  setActiveSort,
  activeSort,
}: TableViewHeaderProps<unknown>) => {
  return (
    <>
      {visibleColumns.map(({ resourceFieldId, label, sortable }, columnIndex) => (
        <Th
          key={resourceFieldId}
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
