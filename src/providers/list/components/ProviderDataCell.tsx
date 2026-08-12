import { type FC, useMemo } from 'react';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';
import type { ProvidersResourceFieldId } from 'src/providers/utils/constants';

import type { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';
import type { ProviderData } from '@utils/providers/types';

import { ProviderDataCellRenderers, ProvidersInventoryFields } from './utils/constants';

type ProviderDataCellProps = {
  resourceData: ProviderData;
  resourceFieldId: string | null;
  resourceFields: ResourceField[];
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

  if (isEmptyCell) {
    return <TableEmptyCell />;
  }

  const DataCellRenderer = ProviderDataCellRenderers?.[resourceFieldId as ProvidersResourceFieldId];

  if (!DataCellRenderer) {
    return <TableEmptyCell />;
  }

  return (
    <Td dataLabel={resourceFieldId ?? undefined} key={resourceFieldId}>
      <DataCellRenderer
        data={resourceData}
        fieldId={resourceFieldId ?? ''}
        fields={resourceFields}
      />
    </Td>
  );
};

export default ProviderDataCell;
