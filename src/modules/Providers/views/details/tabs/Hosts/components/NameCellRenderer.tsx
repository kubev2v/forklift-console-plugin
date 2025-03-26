import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceUrl, TableCell } from 'src/modules/Providers/utils';

import { HostModelRef } from '@kubev2v/types';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import { HostCellProps } from './HostCellProps';

// Define cell renderer for 'name'
export const NameCellRenderer: React.FC<HostCellProps> = ({ data }) => {
  const { host, inventory } = data;

  const hostURL =
    host &&
    getResourceUrl({
      reference: HostModelRef,
      name: host?.metadata?.name,
      namespace: host?.metadata?.namespace,
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
