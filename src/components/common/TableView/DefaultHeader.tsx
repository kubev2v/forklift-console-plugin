import { Th } from '@patternfly/react-table';

import { buildSort } from './sort';
import type { TableViewHeaderProps } from './types';

/**
 * A default table header with sortable columns.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github"></i>
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/TableView/DefaultHeader.tsx)
 */
export const DefaultHeader = <T,>({
  activeSort,
  setActiveSort,
  visibleColumns,
}: TableViewHeaderProps<T>) => {
  return (
    <>
      {visibleColumns.map(({ label, resourceFieldId, sortable }, columnIndex) => (
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
