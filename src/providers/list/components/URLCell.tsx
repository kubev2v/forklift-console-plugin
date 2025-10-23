import type { FC } from 'react';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import type { CellProps } from 'src/modules/Providers/views/list/components/CellProps';

import { Truncate } from '@patternfly/react-core';
import { EMPTY_MSG } from '@utils/constants';

/**
 * URLCell component, used for displaying a TableCell with a URL string.
 * @param {CellProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const URLCell: FC<CellProps> = ({ data, fieldId, fields }) => {
  const id = fieldId as keyof typeof data;
  const url = getResourceFieldValue(data, id, fields) as unknown as string;

  return (
    <TableCell>
      <Truncate content={url?.toString()?.trim() || EMPTY_MSG} position={'middle'} />
    </TableCell>
  );
};
