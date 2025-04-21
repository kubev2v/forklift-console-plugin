import type { FC } from 'react';
import { TableLinkCell } from 'src/modules/Providers/utils/components/TableCell/TableLinkCell';

import { StorageMapModelGroupVersionKind } from '@kubev2v/types';

import type { CellProps } from './CellProps';

export const StorageMapLinkCell: FC<CellProps> = ({ data }) => {
  const { obj: StorageMap } = data;
  const { name, namespace } = StorageMap?.metadata ?? {};

  return (
    <TableLinkCell
      groupVersionKind={StorageMapModelGroupVersionKind}
      name={name}
      namespace={namespace}
    />
  );
};
