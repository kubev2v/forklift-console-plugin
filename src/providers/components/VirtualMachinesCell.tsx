import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';
import { TableLabelCell } from 'src/modules/Providers/utils/components/TableCell/TableLabelCell';
import type { CellProps } from 'src/modules/Providers/views/list/components/CellProps';

import { VirtualMachineIcon } from '@patternfly/react-icons';

import { getProviderDetailsPageUrl } from '../utils/getProviderDetailsPageUrl';

type VirtualMachinesCellProps = {
  inventoryValue?: number;
} & CellProps;

export const VirtualMachinesCell: FC<VirtualMachinesCellProps> = ({
  data,
  fieldId,
  fields,
  inventoryValue,
}: VirtualMachinesCellProps) => {
  const { inventory, provider } = data;
  const value = fields?.length
    ? getResourceFieldValue({ ...provider, inventory }, fieldId, fields)
    : inventoryValue;
  const providerURL = getProviderDetailsPageUrl(provider);

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
