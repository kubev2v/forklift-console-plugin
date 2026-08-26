import { describe, expect, it } from '@jest/globals';
import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import { getPlanMigrationType, isMigrationVirtualMachinePaused } from '../utils';
import { planMigrationVirtualMachineStatuses } from '../../components/PlanStatus/utils/types';

describe('plan details utils - migration type', () => {
  it.each([
    ['warm', MigrationTypeValue.Warm],
    ['live', MigrationTypeValue.Live],
    ['conversion', MigrationTypeValue.Conversion],
    ['cold', MigrationTypeValue.Cold],
  ] as const)('maps spec.type %s', (type, expected) => {
    expect(getPlanMigrationType({ spec: { type } } as never)).toBe(expected);
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
