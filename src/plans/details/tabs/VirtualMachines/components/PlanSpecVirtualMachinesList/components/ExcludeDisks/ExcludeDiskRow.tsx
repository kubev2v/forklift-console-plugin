import type { FC, ReactNode } from 'react';

import type { RowProps } from '@components/common/TableView/types';
import VisibleTableData from '@components/TableCell/VisibleTableData';

import { ExcludeDiskFieldId } from './excludeDiskFields';
import SharedWithOtherVmsCell from './SharedWithOtherVmsCell';
import type { ExcludeDiskRowData } from './types';

const ExcludeDiskRow: FC<RowProps<ExcludeDiskRowData>> = ({ resourceData, resourceFields }) => {
  const rowFields: Record<string, ReactNode> = {
    [ExcludeDiskFieldId.BusAddress]: <>{resourceData.busAddress}</>,
    [ExcludeDiskFieldId.FileName]: <>{resourceData.fileName}</>,
    [ExcludeDiskFieldId.Shared]: <SharedWithOtherVmsCell shared={resourceData.shared} />,
    [ExcludeDiskFieldId.Size]: <>{resourceData.sizeLabel}</>,
  };

  return (
    <>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          fieldId={resourceFieldId ?? ''}
          key={resourceFieldId}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as ExcludeDiskFieldId]}
        </VisibleTableData>
      ))}
    </>
  );
};

export default ExcludeDiskRow;
