import type { FC, ReactNode } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import VisibleTableData from 'src/components/TableCell/VisibleTableData';

import { InspectionVmFieldId } from './utils/inspectionVmFields';
import type { InspectionVmRowData } from './utils/normalizeVmsForInspection';
import InspectionStatusLabel from './InspectionStatusLabel';

const InspectionVmRow: FC<RowProps<InspectionVmRowData>> = ({ resourceData, resourceFields }) => {
  const rowFields: Record<string, ReactNode> = {
    [InspectionVmFieldId.InspectionStatus]: (
      <InspectionStatusLabel phase={resourceData.phase} timestamp={resourceData.timestamp} />
    ),
    [InspectionVmFieldId.Name]: <>{resourceData.name}</>,
    [InspectionVmFieldId.VmId]: <>{resourceData.id}</>,
  };

  return (
    <>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          key={resourceFieldId}
          fieldId={resourceFieldId!}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as InspectionVmFieldId]}
        </VisibleTableData>
      ))}
    </>
  );
};

export default InspectionVmRow;
