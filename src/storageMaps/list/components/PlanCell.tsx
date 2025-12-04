import type { FC } from 'react';
import { TableLinkCell } from 'src/modules/Providers/utils/components/TableCell/TableLinkCell';

import { PlanModelGroupVersionKind } from '@kubev2v/types';

import type { CellProps } from './CellProps';

export const PlanCell: FC<CellProps> = ({ data }) => {
  const plan = data?.obj?.metadata?.ownerReferences?.[0];

  if (!plan) {
    return <>-</>;
  }

  const { obj: StorageMap } = data;
  const { namespace } = StorageMap?.metadata ?? {};
  const { name } = plan || {};

  return (
    <TableLinkCell groupVersionKind={PlanModelGroupVersionKind} name={name} namespace={namespace} />
  );
};
