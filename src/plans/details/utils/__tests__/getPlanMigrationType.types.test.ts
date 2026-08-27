import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import { describe, expect, it } from '@jest/globals';

import { planMigrationVirtualMachineStatuses } from '../../components/PlanStatus/utils/types';
import { getPlanMigrationType, isMigrationVirtualMachinePaused } from '../utils';

describe('plan details utils - migration type', () => {
  it('maps warm type', () => {
    expect(getPlanMigrationType({ spec: { type: 'warm' } } as never)).toBe(MigrationTypeValue.Warm);
  });

  it('maps live type', () => {
    expect(getPlanMigrationType({ spec: { type: 'live' } } as never)).toBe(MigrationTypeValue.Live);
  });

  it('maps conversion type', () => {
    expect(getPlanMigrationType({ spec: { type: 'conversion' } } as never)).toBe(
      MigrationTypeValue.Conversion,
    );
  });

  it('maps cold type', () => {
    expect(getPlanMigrationType({ spec: { type: 'cold' } } as never)).toBe(MigrationTypeValue.Cold);
  });

  it('falls back to warm flag when type is missing', () => {
    expect(getPlanMigrationType({ spec: { warm: true } } as never)).toBe(MigrationTypeValue.Warm);
    expect(getPlanMigrationType({ spec: {} } as never)).toBe(MigrationTypeValue.Cold);
  });

  it('detects paused migration VMs', () => {
    expect(
      isMigrationVirtualMachinePaused({
        phase: planMigrationVirtualMachineStatuses.CopyingPaused,
      } as never),
    ).toBe(true);
    expect(isMigrationVirtualMachinePaused(undefined)).toBe(false);
  });
});
