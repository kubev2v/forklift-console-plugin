import React from 'react';

import { Td, Tr } from '@patternfly/react-table';

import { getResourceFieldValue } from '../FilterGroup';

import { RowProps } from './types';

/**
 * Renders the value for each field as string.
 */
export function DefaultRow<T>({ resourceFields, resourceData }: RowProps<T>) {
  return (
    <Tr onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
      {resourceFields?.map(({ resourceFieldId, label }) => (
        <Td
          key={resourceFieldId}
          dataLabel={label}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          {String(getResourceFieldValue(resourceData, resourceFieldId, resourceFields) ?? '')}
        </Td>
      ))}
    </Tr>
  );
}
