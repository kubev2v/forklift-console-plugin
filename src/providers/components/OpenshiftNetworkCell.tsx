import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';
import { TableLabelCell } from 'src/modules/Providers/utils/components/TableCell/TableLabelCell';
import type { CellProps } from 'src/modules/Providers/views/list/components/CellProps';

import { NetworkIcon } from '@patternfly/react-icons';

import { getProviderURL } from '../utils/getProviderURL';

type OpenshiftNetworkCellProps = {
  inventoryValue?: number;
} & CellProps;

const OpenshiftNetworkCell: FC<OpenshiftNetworkCellProps> = ({
  data: providerData,
  fieldId,
  fields,
  inventoryValue,
}: OpenshiftNetworkCellProps) => {
  const { inventory, provider } = providerData;
  const value = fields?.length
    ? getResourceFieldValue({ ...provider, inventory }, fieldId, fields)
    : inventoryValue;
  const providerURL = getProviderURL(provider);

  if (value === undefined) {
    return <TableEmptyCell />;
  }

  return (
    <TableLabelCell>
      <Link to={`${providerURL}/networks`}>
        <NetworkIcon /> {value}
      </Link>
    </TableLabelCell>
  );
};

export default OpenshiftNetworkCell;
