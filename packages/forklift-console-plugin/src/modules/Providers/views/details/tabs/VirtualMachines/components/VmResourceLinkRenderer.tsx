import React, { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { K8sGroupVersionKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { VMCellProps } from './VMCellProps';

export const withResourceLink = ({
  toName,
  toNamespace,
  toGVK,
}: {
  toName: (props: VMCellProps) => string;
  toNamespace: (props: VMCellProps) => string;
  toGVK: (props: VMCellProps) => K8sGroupVersionKind;
}) => {
  const Enhanced: FC<VMCellProps> = (props: VMCellProps) => {
    const { isProviderLocalTarget, vm } = props.data;
    const isLocal = vm.providerType === 'openshift' && !isProviderLocalTarget;
    return (
      <TableCell>
        <ResourceLink
          name={toName(props)}
          groupVersionKind={toGVK(props)}
          namespace={toNamespace(props)}
          linkTo={isLocal}
        />
      </TableCell>
    );
  };
  Enhanced.displayName = `CellWithResourceLink`;
  return Enhanced;
};
