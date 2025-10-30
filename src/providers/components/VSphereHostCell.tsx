import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';
import { TableLabelCell } from 'src/modules/Providers/utils/components/TableCell/TableLabelCell';
import type { CellProps } from 'src/modules/Providers/views/list/components/CellProps';

import { OutlinedHddIcon } from '@patternfly/react-icons';

import { getProviderDetailsPageUrl } from '../utils/getProviderDetailsPageUrl';

type VSphereHostCellProps = {
  inventoryValue?: number;
} & CellProps;

const VSphereHostCell: FC<VSphereHostCellProps> = ({
  data: providerData,
  fieldId,
  fields,
  inventoryValue,
}: VSphereHostCellProps) => {
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
      <Link to={`${providerURL}/hosts`}>
        <OutlinedHddIcon /> {value}
      </Link>
    </TableLabelCell>
  );
};

export default VSphereHostCell;
