import {
  type MigrationVirtualMachinesStatusesCounts,
  MigrationVirtualMachineStatus,
} from 'src/plans/details/components/PlanStatus/utils/types';

import { describe, expect, it } from '@jest/globals';

import { getMigrationStatusLabel } from '../utils';

const counts = (
  overrides: Partial<Record<MigrationVirtualMachineStatus, number>> = {},
): MigrationVirtualMachinesStatusesCounts => ({
  [MigrationVirtualMachineStatus.Canceled]: { count: 0, vms: [] },
  [MigrationVirtualMachineStatus.CantStart]: { count: 0, vms: [] },
  [MigrationVirtualMachineStatus.Failed]: { count: 0, vms: [] },
  [MigrationVirtualMachineStatus.InProgress]: { count: 0, vms: [] },
  [MigrationVirtualMachineStatus.Paused]: { count: 0, vms: [] },
  [MigrationVirtualMachineStatus.Succeeded]: { count: 0, vms: [] },
  ...Object.fromEntries(
    Object.entries(overrides).map(([status, count]) => [status, { count, vms: [] }]),
  ),
});

describe('getMigrationStatusLabel', () => {
  it('prioritizes InProgress over Failed, Paused, and Succeeded', () => {
    expect(
      getMigrationStatusLabel(
        counts({
          [MigrationVirtualMachineStatus.Failed]: 1,
          [MigrationVirtualMachineStatus.InProgress]: 1,
          [MigrationVirtualMachineStatus.Paused]: 1,
          [MigrationVirtualMachineStatus.Succeeded]: 2,
        }),
        5,
      ),
    ).toBe(MigrationVirtualMachineStatus.InProgress);
  });

  it('returns Failed when nothing is in progress', () => {
    expect(
      getMigrationStatusLabel(
        counts({
          [MigrationVirtualMachineStatus.Failed]: 2,
          [MigrationVirtualMachineStatus.Paused]: 1,
          [MigrationVirtualMachineStatus.Succeeded]: 1,
        }),
        4,
      ),
    ).toBe(MigrationVirtualMachineStatus.Failed);
  });

  it('returns Paused when only paused and succeeded remain', () => {
    expect(
      getMigrationStatusLabel(
        counts({
          [MigrationVirtualMachineStatus.Paused]: 1,
          [MigrationVirtualMachineStatus.Succeeded]: 3,
        }),
        4,
      ),
    ).toBe(MigrationVirtualMachineStatus.Paused);
  });

  it('returns Succeeded only when succeeded count equals migration VM count', () => {
    expect(
      getMigrationStatusLabel(counts({ [MigrationVirtualMachineStatus.Succeeded]: 3 }), 3),
    ).toBe(MigrationVirtualMachineStatus.Succeeded);
    expect(
      getMigrationStatusLabel(counts({ [MigrationVirtualMachineStatus.Succeeded]: 2 }), 3),
    ).toBeNull();
  });

  it('treats zero succeeded with zero migration count as Succeeded', () => {
    expect(getMigrationStatusLabel(counts(), 0)).toBe(MigrationVirtualMachineStatus.Succeeded);
  });

  it('returns null when only Canceled or CantStart VMs are present', () => {
    expect(
      getMigrationStatusLabel(
        counts({
          [MigrationVirtualMachineStatus.Canceled]: 2,
          [MigrationVirtualMachineStatus.CantStart]: 1,
        }),
        3,
      ),
    ).toBeNull();
  });

  it('returns null when succeeded count does not match undefined migration count', () => {
    expect(getMigrationStatusLabel(counts(), undefined)).toBeNull();
    expect(
      getMigrationStatusLabel(counts({ [MigrationVirtualMachineStatus.Succeeded]: 1 }), undefined),
    ).toBeNull();
  });
});
