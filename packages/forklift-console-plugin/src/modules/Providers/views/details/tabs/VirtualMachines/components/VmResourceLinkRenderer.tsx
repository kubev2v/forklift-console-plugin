import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';
import { groupVersionKindForObj } from 'src/utils/resources';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { VMCellProps } from './VMCellProps';
import { VMNameCellRenderer } from './VMNameCellRenderer';

export const VmResourceLinkRenderer: React.FC<VMCellProps> = (props) => {
  const { name, isProviderLocalTarget, vm } = props.data;
  if (vm.providerType === 'openshift' && isProviderLocalTarget) {
    return (
      <TableCell>
        <ResourceLink
          name={name}
          groupVersionKind={groupVersionKindForObj(vm.object)}
          namespace={vm.namespace}
        />
      </TableCell>
    );
  }

  return <VMNameCellRenderer {...props} />;
};
