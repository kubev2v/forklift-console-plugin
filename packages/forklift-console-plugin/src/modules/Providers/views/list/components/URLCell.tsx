import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { getResourceFieldValue } from '@kubev2v/common';
import { Truncate } from '@patternfly/react-core';

import { CellProps } from './CellProps';

/**
 * URLCell component, used for displaying a TableCell with a URL string.
 * @param {CellProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const URLCell: React.FC<CellProps> = ({ data, fieldId, fields }) => {
  const url = (getResourceFieldValue(data, fieldId, fields) ?? '').toString();
  return (
    <TableCell>
      <Truncate content={url} position={'middle'} />
    </TableCell>
  );
};
