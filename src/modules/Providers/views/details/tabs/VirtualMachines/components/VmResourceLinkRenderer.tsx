import React, { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

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
    const { isProviderLocalOpenshift } = props.data;
    return (
      <TableCell>
        <ResourceLink
          name={toName(props)}
          groupVersionKind={toGVK(props)}
          namespace={toNamespace(props)}
          linkTo={isProviderLocalOpenshift}
        />
      </TableCell>
    );
  };
  Enhanced.displayName = `CellWithResourceLink`;
  return Enhanced;
};
