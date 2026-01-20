import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';
import { TableLabelCell } from 'src/components/TableCell/TableLabelCell';
import type { CellProps } from 'src/providers/list/components/CellProps';

import { NetworkIcon } from '@patternfly/react-icons';

import { getProviderDetailsPageUrl } from '../utils/getProviderDetailsPageUrl';

type OpenshiftNetworkCellProps = {
  inventoryValue?: number | string;
} & CellProps;

const OpenshiftNetworkCell: FC<OpenshiftNetworkCellProps> = ({
  data: providerData,
  fieldId,
  fields,
  inventoryValue,
}: OpenshiftNetworkCellProps) => {
  const { inventory, provider } = providerData;
  const value =
    fields?.length && inventory
      ? getResourceFieldValue({ ...provider, inventory }, fieldId, fields)
      : inventoryValue;
  const providerURL = getProviderDetailsPageUrl(provider);

  if (value === undefined || typeof value === 'object') {
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
