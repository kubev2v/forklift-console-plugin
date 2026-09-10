import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { planMigrationVirtualMachineStatuses } from '../../components/PlanStatus/utils/types';
import { getPlanMigrationType, isMigrationVirtualMachinePaused } from '../utils';

const buildPlan = (spec: Partial<V1beta1Plan['spec']>): V1beta1Plan =>
  ({
    metadata: { name: 'test-plan', namespace: 'test-ns' },
    spec,
  }) as unknown as V1beta1Plan;

const buildMigrationVm = (phase: string): V1beta1PlanStatusMigrationVms =>
  ({ phase }) as V1beta1PlanStatusMigrationVms;

describe('plan details utils - migration type', () => {
  it('maps warm type', () => {
    expect(getPlanMigrationType(buildPlan({ type: 'warm' }))).toBe(MigrationTypeValue.Warm);
  });

  it('maps live type', () => {
    expect(getPlanMigrationType(buildPlan({ type: 'live' }))).toBe(MigrationTypeValue.Live);
  });

  it('maps conversion type', () => {
    expect(getPlanMigrationType(buildPlan({ type: 'conversion' }))).toBe(
      MigrationTypeValue.Conversion,
    );
  });

  it('maps cold type', () => {
    expect(getPlanMigrationType(buildPlan({ type: 'cold' }))).toBe(MigrationTypeValue.Cold);
  });

  it('returns Warm when type is cold but warm flag is true', () => {
    expect(getPlanMigrationType(buildPlan({ type: 'cold', warm: true }))).toBe(
      MigrationTypeValue.Warm,
    );
  });

  it('falls back to warm flag when type is missing', () => {
    expect(getPlanMigrationType(buildPlan({ warm: true }))).toBe(MigrationTypeValue.Warm);
    expect(getPlanMigrationType(buildPlan({}))).toBe(MigrationTypeValue.Cold);
  });

  it('detects paused migration VMs', () => {
    expect(
      isMigrationVirtualMachinePaused(
        buildMigrationVm(planMigrationVirtualMachineStatuses.CopyingPaused),
      ),
    ).toBe(true);
    expect(isMigrationVirtualMachinePaused(buildMigrationVm('Running'))).toBe(false);
    expect(isMigrationVirtualMachinePaused(undefined)).toBe(false);
  });
});
