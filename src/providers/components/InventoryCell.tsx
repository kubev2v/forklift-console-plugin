import type { FC } from 'react';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';
import { TableIconCell } from 'src/modules/Providers/utils/components/TableCell/TableIconCell';
import type { CellProps } from 'src/modules/Providers/views/list/components/CellProps';

import { PROVIDER_TYPES } from '../list/utils/constants';
import { ProvidersResourceFieldId } from '../utils/constants';

import OpenshiftNetworkCell from './OpenshiftNetworkCell';
import VSphereHostCell from './VSphereHostCell';

type InventoryCellProps = {
  icon?: JSX.Element;
  inventoryValue?: number;
} & CellProps;

const InventoryCell: FC<InventoryCellProps> = ({ data, fieldId, fields, icon, inventoryValue }) => {
  const { inventory, provider } = data;
  const type = provider?.spec?.type as keyof typeof PROVIDER_TYPES;
  const value = fields?.length
    ? getResourceFieldValue({ ...provider, inventory }, fieldId, fields)
    : inventoryValue;

  if (value === undefined) {
    return <TableEmptyCell />;
  }

  if (
    type === PROVIDER_TYPES.openshift &&
    (fieldId as ProvidersResourceFieldId) === ProvidersResourceFieldId.NetworkCount
  ) {
    return (
      <OpenshiftNetworkCell data={data} fieldId={fieldId} fields={fields} inventoryValue={value} />
    );
  }

  if (
    type === PROVIDER_TYPES.vsphere &&
    (fieldId as ProvidersResourceFieldId) === ProvidersResourceFieldId.HostCount
  ) {
    return <VSphereHostCell data={data} fieldId={fieldId} fields={fields} inventoryValue={value} />;
  }

  return <TableIconCell icon={icon}>{value}</TableIconCell>;
};

export default InventoryCell;
