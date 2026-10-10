import type { ReactElement } from 'react';

import { Th } from '@patternfly/react-table';

import { buildSort } from './sort';
import type { TableViewHeaderProps } from './types';

export const DefaultHeader = <T,>({
  activeSort,
  setActiveSort,
  visibleColumns,
}: TableViewHeaderProps<T>): ReactElement => (
  <>
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
