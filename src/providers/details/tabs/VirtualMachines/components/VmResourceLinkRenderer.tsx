import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';

import { type K8sGroupVersionKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import type { VMCellProps } from './VMCellProps';

export const withResourceLink = ({
  toGVK,
  toName,
  toNamespace,
}: {
  toGVK: (props: VMCellProps) => K8sGroupVersionKind;
  toName: (props: VMCellProps) => string;
  toNamespace: (props: VMCellProps) => string;
}): FC<VMCellProps> => {
  const Enhanced: FC<VMCellProps> = (props: VMCellProps) => {
    const { isProviderLocalOpenshift } = props.data;
    return (
      <TableCell>
        <ResourceLink
          groupVersionKind={toGVK(props)}
          linkTo={isProviderLocalOpenshift}
          name={toName(props)}
          namespace={toNamespace(props)}
        />
      </TableCell>
    );
  };
  Enhanced.displayName = `CellWithResourceLink`;
  return Enhanced;
};
