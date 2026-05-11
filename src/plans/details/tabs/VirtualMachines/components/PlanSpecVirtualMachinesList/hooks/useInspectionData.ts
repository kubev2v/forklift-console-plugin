import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';

import type { V1beta1Plan } from '@forklift-ui/types';
import { getNamespace, getUID } from '@utils/crds/common/selectors';
import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';
import type { VmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';
import { useVmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';
import { useWatchConversions } from '@utils/hooks/useWatchConversions';

import type { SpecVirtualMachinePageData } from '../utils/types';

type UseInspectionDataResult = {
  conversions: V1beta1Conversion[];
  enrichData: (data: SpecVirtualMachinePageData[]) => SpecVirtualMachinePageData[];
  getVmInspectionStatus: (vmId: string) => VmInspectionStatus | undefined;
  inspectionExpandedRows: Set<string>;
  setInspectionExpandedRows: Dispatch<SetStateAction<Set<string>>>;
};

export const useInspectionData = (plan: V1beta1Plan): UseInspectionDataResult => {
  const [conversions] = useWatchConversions({
    namespace: getNamespace(plan) ?? '',
    selector: {
      matchLabels: {
        [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
        [CONVERSION_LABELS.PLAN]: getUID(plan) ?? '',
      },
    },
  });

  const getVmInspectionStatus = useVmInspectionStatus(conversions);
  const [inspectionExpandedRows, setInspectionExpandedRows] = useState<Set<string>>(new Set());

  const enrichData = useCallback(
    (data: SpecVirtualMachinePageData[]): SpecVirtualMachinePageData[] =>
      data.map((item) => ({
        ...item,
        inspectionStatus: getVmInspectionStatus(item.specVM?.id ?? ''),
      })),
    [getVmInspectionStatus],
  );

  return {
    conversions,
    enrichData,
    getVmInspectionStatus,
    inspectionExpandedRows,
    setInspectionExpandedRows,
  };
};
