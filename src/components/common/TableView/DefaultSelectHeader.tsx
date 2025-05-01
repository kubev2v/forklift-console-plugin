import { Th } from '@patternfly/react-table';

import { buildSort } from './sort';
import type { TableViewHeaderProps } from './types';

const DefaultSelectHeader = <T,>({
  activeSort,
  setActiveSort,
  visibleColumns,
}: TableViewHeaderProps<T>) => {
  return (
    <>
      <Th screenReaderText="Row select" />
      {visibleColumns.map(({ label, resourceFieldId, sortable }, columnIndex) => (
        <Th
          key={resourceFieldId}
          sort={
            sortable
              ? buildSort({
                  activeSort,
                  columnIndex,
                  resourceFields: visibleColumns,
                  setActiveSort,
                })
              : undefined
          }
        >
          {label}
        </Th>
      ))}
    </>
  );
};

export default DefaultSelectHeader;
