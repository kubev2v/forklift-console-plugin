import { type FC, useMemo } from 'react';
import type { ProvidersResourceFieldId } from 'src/providers/utils/constants';

import ResizableTd from '@components/common/TableView/ResizableTd';
import type { ResourceField } from '@components/common/utils/types';
import { EMPTY_MSG } from '@utils/constants';
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

  const DataCellRenderer = resourceFieldId
    ? ProviderDataCellRenderers?.[resourceFieldId as ProvidersResourceFieldId]
    : undefined;

  if (isEmptyCell || !DataCellRenderer) {
    return (
      <ResizableTd
        columnId={resourceFieldId}
        dataLabel={resourceFieldId ?? undefined}
        resourceFields={resourceFields}
      >
        {EMPTY_MSG}
      </ResizableTd>
    );
  }

  return (
    <ResizableTd
      columnId={resourceFieldId}
      dataLabel={resourceFieldId ?? undefined}
      key={resourceFieldId}
      resourceFields={resourceFields}
    >
      <DataCellRenderer
        data={resourceData}
        fieldId={resourceFieldId ?? ''}
        fields={resourceFields}
      />
    </ResizableTd>
  );
};

export default ProviderDataCell;
