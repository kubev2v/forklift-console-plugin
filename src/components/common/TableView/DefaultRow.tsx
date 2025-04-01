import React from 'react';

import { Td, Tr } from '@patternfly/react-table';

import { getResourceFieldValue } from '../FilterGroup/matchers';
import { RowProps } from './types';

/**
 * Renders the value for each field as string.
 */
export function DefaultRow<T>({ resourceFields, resourceData }: RowProps<T>) {
  return (
    <Tr>
      {resourceFields?.map(({ resourceFieldId, label }) => (
        <Td key={resourceFieldId} dataLabel={label}>
          {String(getResourceFieldValue(resourceData, resourceFieldId, resourceFields) ?? '')}
        </Td>
      ))}
    </Tr>
  );
}
