import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { HostModelRef } from '@kubev2v/types';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import type { HostCellProps } from './HostCellProps';

// Define cell renderer for 'name'
export const NameCellRenderer: FC<HostCellProps> = ({ data }) => {
  const { host, inventory } = data;

  const hostURL =
    host &&
    getResourceUrl({
      name: host?.metadata?.name,
      namespace: host?.metadata?.namespace,
      reference: HostModelRef,
    });

  return (
    <TableCell>
      {inventory.name}{' '}
      {host && (
        <Link to={hostURL}>
          <ExternalLinkAltIcon />
        </Link>
      )}
    </TableCell>
  );
};
