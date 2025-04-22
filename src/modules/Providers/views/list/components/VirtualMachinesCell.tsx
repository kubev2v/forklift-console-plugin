import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';
import { TableLabelCell } from 'src/modules/Providers/utils/components/TableCell/TableLabelCell';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { ProviderModelRef } from '@kubev2v/types';
import { VirtualMachineIcon } from '@patternfly/react-icons';

import type { CellProps } from './CellProps';

export const VirtualMachinesCell: FC<CellProps> = ({ data, fieldId, fields }: CellProps) => {
  const { inventory, provider } = data;
  const value = getResourceFieldValue({ ...provider, inventory }, fieldId, fields);
  const providerURL = getResourceUrl({
    name: provider?.metadata?.name,
    namespace: provider?.metadata?.namespace,
    reference: ProviderModelRef,
  });

  if (value === undefined) {
    return <TableEmptyCell />;
  }

  return (
    <TableLabelCell>
      <Link to={`${providerURL}/vms`}>
        <VirtualMachineIcon /> {value}
      </Link>
    </TableLabelCell>
  );
};
