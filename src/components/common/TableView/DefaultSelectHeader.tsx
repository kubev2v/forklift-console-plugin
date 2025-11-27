import { Th } from '@patternfly/react-table';

import { buildSort } from './sort';
import type { TableViewHeaderProps } from './types';

const DefaultSelectHeader = <T,>({
  activeSort,
  canSelect,
  setActiveSort,
  visibleColumns,
}: TableViewHeaderProps<T>) => {
  return (
    <>
      {canSelect && <Th screenReaderText="Row select" />}
      {visibleColumns.map(({ info, label, resourceFieldId, sortable }, columnIndex) => (
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
          info={info}
        >
          {label}
        </Th>
      ))}
    </>
  );
};

export default DefaultSelectHeader;
