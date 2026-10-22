import type { V1beta1Migration, V1beta1MigrationSpec } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { getPlanMigrationVirtualMachinesFields } from '../constants';
import {
  type MigrationStatusVirtualMachinePageData,
  MigrationStatusVirtualMachinesTableResourceId,
} from '../types';
import { getVMCutover } from '../utils';

const VM_ID = 'vm-1000';
const OTHER_VM_ID = 'vm-2000';
const PLAN_CUTOVER = '2030-10-20T10:00:00.000Z';
const VM_CUTOVER = '2030-10-21T18:30:00.000Z';

const buildRow = (spec: Partial<V1beta1MigrationSpec>): MigrationStatusVirtualMachinePageData =>
  ({
    migration: { spec } as unknown as V1beta1Migration,
    vmId: VM_ID,
  }) as unknown as MigrationStatusVirtualMachinePageData;

const fieldIds = (isWarm: boolean): (string | null)[] =>
  getPlanMigrationVirtualMachinesFields(isWarm).map((field) => field.resourceFieldId);

describe('getPlanMigrationVirtualMachinesFields', () => {
  it('adds the cutover and actions columns for warm plans only', () => {
    expect(fieldIds(true)).toContain(MigrationStatusVirtualMachinesTableResourceId.Cutover);
    expect(fieldIds(true)).toContain(MigrationStatusVirtualMachinesTableResourceId.Actions);

    expect(fieldIds(false)).not.toContain(MigrationStatusVirtualMachinesTableResourceId.Cutover);
    expect(fieldIds(false)).not.toContain(MigrationStatusVirtualMachinesTableResourceId.Actions);
  });
});

describe('getVMCutover', () => {
  it('sorts on the effective cutover, so overrides and inherited times interleave by date', () => {
    const overridesToEarlierTime = buildRow({
      cutover: VM_CUTOVER,
      vmCutover: [{ cutover: PLAN_CUTOVER, id: VM_ID }],
    });
    const inheritsLaterPlanTime = buildRow({ cutover: VM_CUTOVER });

    expect(getVMCutover(overridesToEarlierTime)).toBe(PLAN_CUTOVER);
    expect(getVMCutover(inheritsLaterPlanTime)).toBe(VM_CUTOVER);
    expect(getVMCutover(overridesToEarlierTime) < getVMCutover(inheritsLaterPlanTime)).toBe(true);
  });

  it('ignores an override belonging to a different VM', () => {
    // Regression guard: this sort key and VMCutoverCellRenderer must read the same source.
    // When the accessor dropped the inherited fallback, rows displayed the plan time but
    // sorted as empty, bunching every inheriting VM at one end of the column.
    const row = buildRow({
      cutover: PLAN_CUTOVER,
      vmCutover: [{ cutover: VM_CUTOVER, id: OTHER_VM_ID }],
    });

    expect(getVMCutover(row)).toBe(PLAN_CUTOVER);
  });

  it('returns an empty key when there is no cutover to sort by', () => {
    expect(getVMCutover(buildRow({}))).toBe('');
  });
});
