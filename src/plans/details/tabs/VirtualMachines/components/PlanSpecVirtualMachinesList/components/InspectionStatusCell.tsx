import type { FC } from 'react';
import InspectionConcernBadges from 'src/components/InspectVirtualMachines/InspectionConcernBadges';
import InspectionStatusLabel from 'src/components/InspectVirtualMachines/InspectionStatusLabel';

import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import { getInspectionResult } from '@utils/crds/conversion/selectors';
import type { VmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';

type InspectionStatusCellProps = {
  inspectionStatus: VmInspectionStatus | undefined;
};

const InspectionStatusCell: FC<InspectionStatusCellProps> = ({ inspectionStatus }) => {
  if (inspectionStatus?.status === INSPECTION_STATUS.ISSUES_FOUND) {
    const concerns = getInspectionResult(inspectionStatus.conversion)?.concerns ?? [];
    return <InspectionConcernBadges concerns={concerns} />;
  }

  return (
    <InspectionStatusLabel
      status={inspectionStatus?.status ?? INSPECTION_STATUS.NOT_INSPECTED}
      testId="inspection-status-cell"
    />
  );
};

export default InspectionStatusCell;
