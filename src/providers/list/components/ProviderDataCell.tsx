import { type FC, useMemo } from 'react';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';
import type { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';

import type { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';

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
    ProviderDataCellRenderers?.[resourceFieldId! as ProvidersResourceFieldId];

  return (
    <Td key={resourceFieldId} dataLabel={resourceFieldId!}>
      <DataCellRenderer data={resourceData} fieldId={resourceFieldId!} fields={resourceFields} />
    </Td>
  );
};

export default ProviderDataCell;
