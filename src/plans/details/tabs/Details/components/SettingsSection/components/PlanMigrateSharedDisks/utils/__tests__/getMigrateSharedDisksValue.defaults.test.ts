import type { V1beta1Plan } from '@forklift-ui/types';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

import { getMigrateSharedDisksValue, getVmMigrateSharedDisks } from '../utils';

describe('getMigrateSharedDisksValue - defaults', () => {
  it('defaults to true when the plan omits migrateSharedDisks', () => {
    expect(getMigrateSharedDisksValue({ spec: {} } as V1beta1Plan)).toBe(true);
    expect(getMigrateSharedDisksValue({} as V1beta1Plan)).toBe(true);
  });

  it('returns the explicit plan boolean', () => {
    expect(getMigrateSharedDisksValue({ spec: { migrateSharedDisks: false } } as V1beta1Plan)).toBe(
      false,
    );
    expect(getMigrateSharedDisksValue({ spec: { migrateSharedDisks: true } } as V1beta1Plan)).toBe(
      true,
    );
  });
});

describe('getVmMigrateSharedDisks - defaults', () => {
  it('returns undefined for missing VM or field', () => {
    expect(getVmMigrateSharedDisks(undefined)).toBeUndefined();
    expect(getVmMigrateSharedDisks({})).toBeUndefined();
  });

  it('returns the VM-level boolean', () => {
    expect(getVmMigrateSharedDisks({ migrateSharedDisks: false })).toBe(false);
    expect(getVmMigrateSharedDisks({ migrateSharedDisks: true })).toBe(true);
  });
});
