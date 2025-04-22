import type { FC } from 'react';
import { TableLinkCell } from 'src/modules/Providers/utils/components/TableCell/TableLinkCell';

import type { CellProps } from './CellProps';

/**
 * NamespaceCell component, used for displaying a link cell with information about the namespace.
 * @param {CellProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const NamespaceCell: FC<CellProps> = ({ data }) => {
  const { obj: networkMap } = data;
  const { namespace } = networkMap?.metadata || {};

  return (
    <TableLinkCell
      groupVersionKind={{ kind: 'Namespace', version: 'v1' }}
      name={namespace}
      namespace={namespace}
    />
  );
};
