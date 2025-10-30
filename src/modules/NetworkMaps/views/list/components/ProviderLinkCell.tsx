import type { FC } from 'react';
import { TableLinkCell } from 'src/modules/Providers/utils/components/TableCell/TableLinkCell';

import { ProviderModelGroupVersionKind, type V1beta1NetworkMapSpecProvider } from '@kubev2v/types';

import type { CellProps } from './CellProps';

export const ProviderLinkCell: FC<CellProps> = ({ data, fieldId }) => {
  const provider = data.obj?.spec?.provider?.[fieldId as keyof V1beta1NetworkMapSpecProvider];
  const { name, namespace } = provider ?? {};

  if (!provider) {
    return <>-</>;
  }

  return (
    <TableLinkCell
      groupVersionKind={ProviderModelGroupVersionKind}
      name={name}
      namespace={namespace}
    />
  );
};
