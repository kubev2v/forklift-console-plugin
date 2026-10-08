import type { ReactElement, ReactNode } from 'react';

import TableRow from '../DataViewTable/TableRow';
import { getResourceFieldValue } from '../FilterGroup/matchers';

import ResizableTd from './ResizableTd';
import type { RowProps } from './types';

/**
 * Renders the value for each field as string.
 */
export const DefaultRow = <T,>({ resourceData, resourceFields }: RowProps<T>): ReactElement => {
  return (
    <TableRow>
      {resourceFields?.reduce<ReactNode[]>((acc, { label, resourceFieldId }) => {
        if (resourceFieldId) {
          acc.push(
            <ResizableTd
              columnId={resourceFieldId}
              dataLabel={label ?? undefined}
              key={resourceFieldId}
              resourceFields={resourceFields}
            >
              {(getResourceFieldValue(
                resourceData as Record<
                  string,
                  object | string | boolean | ((data: unknown) => unknown)
                >,
                resourceFieldId ?? '',
                resourceFields,
              ) as string) ?? ''}
            </ResizableTd>,
          );
        }
        return acc;
      }, [])}
    </TableRow>
  );
};
