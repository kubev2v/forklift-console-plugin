import type { ReactNode } from 'react';

import { Td, Tr } from '@patternfly/react-table';

import { getResourceFieldValue } from '../FilterGroup/matchers';

import type { RowProps } from './types';

/**
 * Renders the value for each field as string.
 */
export const DefaultRow = <T,>({ resourceData, resourceFields }: RowProps<T>) => {
  return (
    <Tr>
      {resourceFields?.reduce<ReactNode[]>((acc, { label, resourceFieldId }) => {
        if (resourceFieldId) {
          acc.push(
            <Td dataLabel={label ?? undefined} key={resourceFieldId}>
              {(getResourceFieldValue(
                resourceData as Record<
                  string,
                  object | string | boolean | ((data: unknown) => unknown)
                >,
                resourceFieldId ?? '',
                resourceFields,
              ) as string) ?? ''}
            </Td>,
          );
        }
        return acc;
      }, [])}
    </Tr>
  );
};
