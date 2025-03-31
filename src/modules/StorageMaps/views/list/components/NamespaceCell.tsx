import React from 'react';
import { TableLinkCell } from 'src/modules/Providers/utils';

import type { CellProps } from './CellProps';

/**
 * NamespaceCell component, used for displaying a link cell with information about the namespace.
 * @param {CellProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const NamespaceCell: React.FC<CellProps> = ({ data }) => {
  const { obj: StorageMap } = data;
  const { namespace } = StorageMap?.metadata || {};

  return (
    <TableLinkCell
      groupVersionKind={{ kind: 'Namespace', version: 'v1' }}
      name={namespace}
      namespace={namespace}
    />
  );
};
