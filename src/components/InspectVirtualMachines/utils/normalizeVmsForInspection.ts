import type { V1beta1PlanSpecVms } from '@forklift-ui/types';
import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import { isConversionActive } from '@utils/crds/conversion/selectors';
import type { VmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';

import type { InspectionVmRowData } from './types';

type GetVmInspectionStatusFn = (vmId: string) => VmInspectionStatus | undefined;

export const normalizePlanVms = (
  planVms: V1beta1PlanSpecVms[],
  getVmInspectionStatus: GetVmInspectionStatusFn,
): InspectionVmRowData[] =>
  planVms.map((specVm) => {
    const vmId = specVm.id ?? '';
    const status = getVmInspectionStatus(vmId);
    const hasActiveInspection = status?.conversion ? isConversionActive(status.conversion) : false;

    return {
      id: vmId,
      inspectionStatus: status?.status ?? INSPECTION_STATUS.NOT_INSPECTED,
      isActive: hasActiveInspection,
      name: specVm.name ?? vmId,
      timestamp: status?.lastRun,
    };
  });

export const normalizeInventoryVms = (
  inventoryVms: { id?: string; name?: string }[],
  getVmInspectionStatus: GetVmInspectionStatusFn,
): InspectionVmRowData[] =>
  inventoryVms.map((vm) => {
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
