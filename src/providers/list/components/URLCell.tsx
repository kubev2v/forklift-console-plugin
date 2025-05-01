import type { FC } from 'react';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import type { CellProps } from 'src/modules/Providers/views/list/components/CellProps';

import { Truncate } from '@patternfly/react-core';

import { EMPTY_CELL_CONTENT } from './utils/constants';

/**
 * URLCell component, used for displaying a TableCell with a URL string.
 * @param {CellProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const URLCell: FC<CellProps> = ({ data, fieldId, fields }) => {
  const url: string = getResourceFieldValue(data, fieldId, fields);

  return (
    <TableCell>
      <Truncate content={url?.toString() ?? EMPTY_CELL_CONTENT} position={'middle'} />
    </TableCell>
  );
};
