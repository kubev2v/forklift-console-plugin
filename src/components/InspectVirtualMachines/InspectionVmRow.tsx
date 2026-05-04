import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import VisibleTableData from 'src/components/TableCell/VisibleTableData';

import { InspectionVmFieldId } from './utils/inspectionVmFields';
import InspectionStatusLabel from './InspectionStatusLabel';

type InspectionVmRowData = {
  id: string;
  isActive: boolean;
  name: string;
  phase?: string;
  timestamp?: string;
};

const InspectionVmRow: FC<RowProps<InspectionVmRowData>> = ({ resourceData, resourceFields }) => {
  const rowFields: Record<string, React.ReactNode> = {
    [InspectionVmFieldId.InspectionStatus]: (
      <InspectionStatusLabel
        phase={resourceData.phase as Parameters<typeof InspectionStatusLabel>[0]['phase']}
        timestamp={resourceData.timestamp}
      />
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
