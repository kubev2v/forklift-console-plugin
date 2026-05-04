import type { V1beta1PlanSpecVms } from '@forklift-ui/types';
import type { ConversionPhase } from '@utils/crds/conversion/types';
import type { VmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';

import { isConversionActive } from '../../../utils/crds/conversion/selectors';

export type InspectionVmRowData = {
  id: string;
  isActive: boolean;
  name: string;
  phase?: ConversionPhase;
  timestamp?: string;
};

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
      isActive: hasActiveInspection,
      name: specVm.name ?? vmId,
      phase: status?.phase,
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
      isActive: hasActiveInspection,
      name: vm.name ?? vmId,
      phase: status?.phase,
      timestamp: status?.lastRun,
    };
  });
