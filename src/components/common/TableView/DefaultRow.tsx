import { Td, Tr } from '@patternfly/react-table';

import { getResourceFieldValue } from '../FilterGroup/matchers';

import type { RowProps } from './types';

/**
 * Renders the value for each field as string.
 */
export const DefaultRow = <T,>({ resourceData, resourceFields }: RowProps<T>) => {
  return (
    <Tr>
      {resourceFields?.map(({ label, resourceFieldId }) => (
        <Td key={resourceFieldId} dataLabel={label}>
          {String(getResourceFieldValue(resourceData, resourceFieldId, resourceFields) ?? '')}
        </Td>
      ))}
    </Tr>
  );
};
