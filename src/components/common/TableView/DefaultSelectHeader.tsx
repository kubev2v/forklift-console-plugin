import type { ReactElement } from 'react';

import { Th } from '@patternfly/react-table';

import { buildSort } from './sort';
import type { TableViewHeaderProps } from './types';

const DefaultSelectHeader = <T,>({
  activeSort,
  canSelect,
  setActiveSort,
  visibleColumns,
}: TableViewHeaderProps<T>): ReactElement => (
  <>
    {canSelect && <Th screenReaderText="Row select" />}
    {visibleColumns.map((field, columnIndex) => (
      <Th
        data-testid={field.testId}
        info={field.info}
        key={field.resourceFieldId ?? columnIndex}
        sort={
          field.sortable
            ? buildSort({
                activeSort,
                columnIndex,
                resourceFields: visibleColumns,
                setActiveSort,
              })
            : undefined
        }
      >
        {field.label}
      </Th>
    ))}
  </>
);

export default DefaultSelectHeader;
