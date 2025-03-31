import React from 'react';
import { TableLinkCell } from 'src/modules/Providers/utils';

import { StorageMapModelGroupVersionKind } from '@kubev2v/types';

import type { CellProps } from './CellProps';

export const StorageMapLinkCell: React.FC<CellProps> = ({ data }) => {
  const { obj: StorageMap } = data;
  const { name, namespace } = StorageMap?.metadata || {};

  return (
    <TableLinkCell
      groupVersionKind={StorageMapModelGroupVersionKind}
      name={name}
      namespace={namespace}
    />
  );
};
