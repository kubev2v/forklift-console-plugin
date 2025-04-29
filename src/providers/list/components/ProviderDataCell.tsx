import { type FC, useMemo } from 'react';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';

import type { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';

import type { ProvidersTableResourceFieldId } from '../utils/constants';

import { ProviderDataCellRenderers, ProvidersInventoryFields } from './utils/constants';

type ProviderDataCellProps = {
  resourceFieldId: string | null;
  resourceFields: ResourceField[];
  resourceData: ProviderData;
};

const ProviderDataCell: FC<ProviderDataCellProps> = ({
  resourceData,
  resourceFieldId,
  resourceFields,
}) => {
  const hasInventoryData = useMemo(() => !resourceData?.inventory, [resourceData]);
  const isInventoryField = useMemo(
    () => resourceFieldId && Object.keys(ProvidersInventoryFields).includes(resourceFieldId),
    [resourceFieldId],
  );
  const isEmptyCell = useMemo(
    () => !resourceFieldId || (isInventoryField && !hasInventoryData),
    [resourceFieldId, hasInventoryData, isInventoryField],
  );

  if (isEmptyCell) return <TableEmptyCell />;

  const DataCellRenderer =
    ProviderDataCellRenderers?.[resourceFieldId! as ProvidersTableResourceFieldId];

  return (
    <Td key={resourceFieldId} dataLabel={resourceFieldId!}>
      <DataCellRenderer data={resourceData} fieldId={resourceFieldId!} fields={resourceFields} />
    </Td>
  );
};

export default ProviderDataCell;
