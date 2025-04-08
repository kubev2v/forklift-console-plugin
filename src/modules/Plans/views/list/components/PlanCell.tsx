import type { FC } from 'react';
import { TableLinkCell } from 'src/modules/Providers/utils/components/TableCell/TableLinkCell';

import { PlanModelGroupVersionKind } from '@kubev2v/types';

import type { CellProps } from './CellProps';

export const PlanCell: FC<CellProps> = ({ data }) => {
  const { plan } = data;
  const { name, namespace } = plan?.metadata || {};

  if (!plan) {
    return <>-</>;
  }

  return (
    <TableLinkCell groupVersionKind={PlanModelGroupVersionKind} name={name} namespace={namespace} />
  );
};
