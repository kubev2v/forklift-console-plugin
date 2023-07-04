import React from 'react';

import { Th } from '@patternfly/react-table';

import { buildSort } from './sort';
import { TableViewHeaderProps } from './types';

/**
 * A default table header with sortable columns.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github"></i>
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/TableView/DefaultHeader.tsx)
 */
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
