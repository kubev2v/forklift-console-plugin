import React from 'react';
import { TableLinkCell } from 'src/modules/Providers/utils';

import { PlanModelGroupVersionKind } from '@kubev2v/types';

import type { CellProps } from './CellProps';

export const PlanCell: React.FC<CellProps> = ({ data }) => {
  const plan = data?.obj?.metadata?.ownerReferences?.[0];

  if (!plan) {
    return <>-</>;
  }

  const { obj: StorageMap } = data;
  const { namespace } = StorageMap?.metadata || {};
  const { name } = plan || {};

  return (
    <TableLinkCell groupVersionKind={PlanModelGroupVersionKind} name={name} namespace={namespace} />
  );
};
