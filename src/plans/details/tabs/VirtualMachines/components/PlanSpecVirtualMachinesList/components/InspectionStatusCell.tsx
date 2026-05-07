import type { FC } from 'react';
import InspectionStatusLabel from 'src/components/InspectVirtualMachines/InspectionStatusLabel';

import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import type { VmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';

type InspectionStatusCellProps = {
  inspectionStatus: VmInspectionStatus | undefined;
};

const InspectionStatusCell: FC<InspectionStatusCellProps> = ({ inspectionStatus }) => {
  return (
    <InspectionStatusLabel
      status={inspectionStatus?.status ?? INSPECTION_STATUS.NOT_INSPECTED}
      testId="inspection-status-cell"
    />
  );
};

export default InspectionStatusCell;
