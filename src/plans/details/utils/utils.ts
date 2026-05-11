import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';
import { ConcernCategory } from 'src/providers/details/tabs/VirtualMachines/constants';

import type { VirtualMachineWithConcerns } from '@components/Concerns/utils/constants';
import type { Concern, V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { CATEGORY_TYPES } from '@utils/constants';
import { getCreatedAt, getLabels } from '@utils/crds/common/selectors';
import { CONVERSION_LABELS, CONVERSION_PHASE } from '@utils/crds/conversion/constants';
import { getConversionPhase, getInspectionResult } from '@utils/crds/conversion/selectors';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';

import { planMigrationVirtualMachineStatuses } from '../components/PlanStatus/utils/types';
import type { SpecVirtualMachinePageData } from '../tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/utils/types';

export const isMigrationVirtualMachinePaused = (vm: V1beta1PlanStatusMigrationVms | undefined) =>
  vm?.phase === planMigrationVirtualMachineStatuses.CopyingPaused;

export const getPlanMigrationType = (plan: V1beta1Plan): MigrationTypeValue => {
  switch (plan?.spec?.type) {
    case 'warm':
      return MigrationTypeValue.Warm;
    case 'live':
      return MigrationTypeValue.Live;
    case 'conversion':
      return MigrationTypeValue.Conversion;
    case 'cold':
    case undefined:
    default:
      if (plan?.spec?.warm) {
        return MigrationTypeValue.Warm;
      }
      return MigrationTypeValue.Cold;
  }
};

export const getCriticalConcernsVmsMap = (vms: SpecVirtualMachinePageData[]) => {
  const map = new Map<string, number>();

  for (const vmData of vms ?? []) {
    const vmConcerns: Concern[] = (vmData?.inventoryVmData?.vm as VirtualMachineWithConcerns)
      ?.concerns;
    for (const concern of vmConcerns ?? []) {
      if (concern?.category === ConcernCategory?.Critical) {
        map.set(concern?.label, (map?.get(concern?.label) ?? 0) + 1);
      }
    }
  }
  return map;
};

const resolveLatestSucceededPerVm = (
  conversions: V1beta1Conversion[],
): Map<string, V1beta1Conversion> => {
  const map = new Map<string, V1beta1Conversion>();
  for (const conversion of conversions) {
    if (
      getConversionPhase(conversion) === CONVERSION_PHASE.SUCCEEDED &&
      getInspectionResult(conversion)
    ) {
      const vmId = getLabels(conversion)?.[CONVERSION_LABELS.VM_ID] ?? '';
      const existing = map.get(vmId);
      if (!existing || (getCreatedAt(conversion) ?? '') > (getCreatedAt(existing) ?? '')) {
        map.set(vmId, conversion);
      }
    }
  }
  return map;
};

export const getCriticalInspectionConcernsVmsMap = (
  conversions: V1beta1Conversion[],
): Map<string, number> => {
  const latestPerVm = resolveLatestSucceededPerVm(conversions);
  const labelToVmIds = new Map<string, Set<string>>();

  for (const [vmId, conversion] of latestPerVm) {
    const concerns = getInspectionResult(conversion)?.concerns ?? [];
    for (const concern of concerns) {
      if (
        concern.category === CATEGORY_TYPES.CRITICAL ||
        concern.category === CATEGORY_TYPES.ERROR
      ) {
        const vmIds = labelToVmIds.get(concern.label) ?? new Set();
        vmIds.add(vmId);
        labelToVmIds.set(concern.label, vmIds);
      }
    }
  }

  const result = new Map<string, number>();
  for (const [label, vmIds] of labelToVmIds) {
    result.set(label, vmIds.size);
  }
  return result;
};

export const mergeConcernsMaps = (
  inventoryMap: Map<string, number>,
  inspectionMap: Map<string, number>,
): Map<string, number> => {
  const merged = new Map(inventoryMap);
  for (const [label, count] of inspectionMap) {
    merged.set(label, Math.max(merged.get(label) ?? 0, count));
  }
  return merged;
};
