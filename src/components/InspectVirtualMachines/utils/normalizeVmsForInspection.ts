import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import { isConversionActive } from '@utils/crds/conversion/selectors';
import type { VmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';

import type { InspectionVmRowData } from './types';

type NormalizableVm = { id?: string; name?: string };

type GetVmInspectionStatusFn = (vmId: string) => VmInspectionStatus | undefined;

export const normalizeVmsForInspection = (
  vms: NormalizableVm[],
  getVmInspectionStatus: GetVmInspectionStatusFn,
): InspectionVmRowData[] =>
  vms.map((vm) => {
    const vmId = vm.id ?? '';
    const status = getVmInspectionStatus(vmId);
    const hasActiveInspection = status?.conversion ? isConversionActive(status.conversion) : false;

    return {
      id: vmId,
      inspectionStatus: status?.status ?? INSPECTION_STATUS.NOT_INSPECTED,
      isActive: hasActiveInspection,
      name: vm.name ?? vmId,
      timestamp: status?.lastRun,
    };
  });
