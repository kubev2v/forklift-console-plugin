import { areExcludeDiskSelectionsEqual } from 'src/plans/utils/excludeDisks/excludeDiskSelection';

import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import type { V1beta1Plan } from '@forklift-ui/types';
import { getPlanVirtualMachines, getVmExcludeDisks } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

import type { EditVmWizardFormValues } from '../types';

type EditVmPatchOperation = {
  op: string;
  path: string;
  value?: unknown;
};

const vmPath = (vmIndex: number, field: string): string => `/spec/vms/${vmIndex}/${field}`;

const pushStringFieldPatch = (
  operations: EditVmPatchOperation[],
  path: string,
  newValue: string | undefined,
  current: string | undefined,
  allowRemoveOnClear = false,
): void => {
  if (newValue === current) {
    return;
  }

  if (isEmpty(newValue)) {
    if (current === undefined) {
      return;
    }

    operations.push({
      op: allowRemoveOnClear ? REMOVE : REPLACE,
      path,
      ...(allowRemoveOnClear ? {} : { value: undefined }),
    });
    return;
  }

  operations.push({
    op: current === undefined ? ADD : REPLACE,
    path,
    value: newValue,
  });
};

export const buildEditVmPatchOperations = (
  plan: V1beta1Plan,
  vmIndex: number,
  values: EditVmWizardFormValues,
): EditVmPatchOperation[] => {
  const vm = getPlanVirtualMachines(plan)[vmIndex] as EnhancedPlanSpecVms | undefined;
  const operations: EditVmPatchOperation[] = [];

  const currentTargetName = vm?.targetName;
  if (values.targetName !== (currentTargetName ?? '')) {
    if (isEmpty(values.targetName)) {
      if (!isEmpty(currentTargetName)) {
        operations.push({ op: REMOVE, path: vmPath(vmIndex, 'targetName') });
      }
    } else {
      operations.push({
        op: currentTargetName === undefined ? ADD : REPLACE,
        path: vmPath(vmIndex, 'targetName'),
        value: values.targetName,
      });
    }
  }

  const currentPowerState = vm?.targetPowerState;
  if (values.targetPowerState !== currentPowerState) {
    const powerStatePath = vmPath(vmIndex, 'targetPowerState');
    if (values.targetPowerState === undefined) {
      if (currentPowerState !== undefined) {
        operations.push({ op: REMOVE, path: powerStatePath });
      }
    } else {
      operations.push({
        op: currentPowerState === undefined ? ADD : REPLACE,
        path: powerStatePath,
        value: values.targetPowerState,
      });
    }
  }

  const currentInstanceType = vm?.instanceType;
  if (values.instanceType !== currentInstanceType) {
    if (!values.instanceType && currentInstanceType) {
      operations.push({ op: REMOVE, path: vmPath(vmIndex, 'instanceType') });
    } else if (values.instanceType) {
      operations.push({
        op: currentInstanceType === undefined ? ADD : REPLACE,
        path: vmPath(vmIndex, 'instanceType'),
        value: values.instanceType,
      });
    }
  }

  const currentExcludeDisks = getVmExcludeDisks(vm) ?? [];
  if (!areExcludeDiskSelectionsEqual(values.excludeDisks, currentExcludeDisks)) {
    const path = vmPath(vmIndex, 'excludeDisks');
    if (isEmpty(values.excludeDisks)) {
      if (!isEmpty(currentExcludeDisks)) {
        operations.push({ op: REMOVE, path });
      }
    } else {
      operations.push({
        op: isEmpty(currentExcludeDisks) ? ADD : REPLACE,
        path,
        value: values.excludeDisks,
      });
    }
  }

  const currentMigrateSharedDisks = vm?.migrateSharedDisks;
  if (values.migrateSharedDisks !== currentMigrateSharedDisks) {
    const path = vmPath(vmIndex, 'migrateSharedDisks');
    if (values.migrateSharedDisks === undefined) {
      if (currentMigrateSharedDisks !== undefined) {
        operations.push({ op: REMOVE, path });
      }
    } else {
      operations.push({
        op: currentMigrateSharedDisks === undefined ? ADD : REPLACE,
        path,
        value: values.migrateSharedDisks,
      });
    }
  }

  pushStringFieldPatch(
    operations,
    vmPath(vmIndex, 'pvcNameTemplate'),
    values.pvcNameTemplate,
    vm?.pvcNameTemplate,
    true,
  );
  pushStringFieldPatch(
    operations,
    vmPath(vmIndex, 'volumeNameTemplate'),
    values.volumeNameTemplate,
    vm?.volumeNameTemplate,
    true,
  );
  pushStringFieldPatch(
    operations,
    vmPath(vmIndex, 'networkNameTemplate'),
    values.networkNameTemplate,
    vm?.networkNameTemplate,
    true,
  );

  return operations;
};
