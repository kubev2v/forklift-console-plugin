import type { FC } from 'react';
import InspectionStatusLabel from 'src/components/InspectVirtualMachines/InspectionStatusLabel';

import type { VmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';

type InspectionStatusCellProps = {
  inspectionStatus: VmInspectionStatus | undefined;
};

const InspectionStatusCell: FC<InspectionStatusCellProps> = ({ inspectionStatus }) => {
  return (
    <InspectionStatusLabel phase={inspectionStatus?.phase} timestamp={inspectionStatus?.lastRun} />
  );
};

export default InspectionStatusCell;
