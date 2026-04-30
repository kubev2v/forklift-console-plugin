import type { FC } from 'react';
import InspectionStatusLabel from 'src/components/InspectVirtualMachines/InspectionStatusLabel';

import { getNamespace, getUID } from '@utils/crds/common/selectors';
import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';
import { useVmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';
import { useWatchConversions } from '@utils/hooks/useWatchConversions';

import type { SpecVirtualMachinePageData } from '../utils/types';

type InspectionStatusCellProps = {
  data: SpecVirtualMachinePageData;
};

const InspectionStatusCell: FC<InspectionStatusCellProps> = ({ data }) => {
  const { plan } = data;
  const vmId = data.specVM?.id ?? '';

  const [conversions] = useWatchConversions({
    namespace: getNamespace(plan) ?? '',
    selector: {
      matchLabels: {
        [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
        [CONVERSION_LABELS.PLAN]: getUID(plan) ?? '',
      },
    },
  });

  const getStatus = useVmInspectionStatus(conversions);
  const status = getStatus(vmId);

  return <InspectionStatusLabel phase={status?.phase} timestamp={status?.lastRun} />;
};

export default InspectionStatusCell;
