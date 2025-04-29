import type { FC } from 'react';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';
import { TableIconCell } from 'src/modules/Providers/utils/components/TableCell/TableIconCell';
import type { CellProps } from 'src/modules/Providers/views/list/components/CellProps';

import { PROVIDER_TYPES, ProvidersTableResourceFieldId } from '../utils/constants';

import OpenshiftNetworkCell from './OpenshiftNetworkCell';
import VSphereHostCell from './VSphereHostCell';

type InventoryCellProps = {
  icon?: JSX.Element;
} & CellProps;

const InventoryCell: FC<InventoryCellProps> = ({ data, fieldId, fields, icon }) => {
  const { inventory, provider } = data;
  const type = provider?.spec?.type as keyof typeof PROVIDER_TYPES;

  const value = getResourceFieldValue({ ...provider, inventory }, fieldId, fields);

  if (value === undefined) {
    return <TableEmptyCell />;
  }

  if (
    type === PROVIDER_TYPES.openshift &&
    (fieldId as ProvidersTableResourceFieldId) === ProvidersTableResourceFieldId.NetworkCount
  ) {
    return <OpenshiftNetworkCell data={data} fieldId={fieldId} fields={fields} />;
  }

  if (
    type === PROVIDER_TYPES.vsphere &&
    (fieldId as ProvidersTableResourceFieldId) === ProvidersTableResourceFieldId.HostCount
  ) {
    return <VSphereHostCell data={data} fieldId={fieldId} fields={fields} />;
  }

  return <TableIconCell icon={icon}>{value}</TableIconCell>;
};

export default InventoryCell;
