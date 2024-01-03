import React, { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { K8sGroupVersionKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { VMCellProps } from './VMCellProps';

export const withResourceLink = ({
  toName,
  toGVK,
  Component,
}: {
  toName: (props: VMCellProps) => string;
  toGVK: (props: VMCellProps) => K8sGroupVersionKind;
  Component: FC<VMCellProps>;
}) => {
  const Enhanced: FC<VMCellProps> = (props: VMCellProps) => {
    const { isProviderLocalTarget, vm } = props.data;
    if (vm.providerType === 'openshift' && isProviderLocalTarget) {
      return (
        <TableCell>
          <ResourceLink
            name={toName(props)}
            groupVersionKind={toGVK(props)}
            namespace={vm.namespace}
          />
        </TableCell>
      );
    }

    return <Component {...props} />;
  };
  Enhanced.displayName = `${Component?.displayName ?? 'Component'}WithResourceLink`;
  return Enhanced;
};
