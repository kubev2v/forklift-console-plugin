import React from 'react';
import { TableLinkCell } from 'src/modules/Providers/utils';

import { PlanModelGroupVersionKind } from '@kubev2v/types';

import { CellProps } from './CellProps';

export const PlanCell: React.FC<CellProps> = ({ data }) => {
  const { obj } = data;
  const { name, namespace } = obj?.metadata || {};

  if (!obj) {
    return <>-</>;
  }

  return (
    <TableLinkCell groupVersionKind={PlanModelGroupVersionKind} name={name} namespace={namespace} />
  );
};
