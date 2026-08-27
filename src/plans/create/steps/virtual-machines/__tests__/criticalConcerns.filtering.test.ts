import { ConcernCategory } from 'src/providers/details/tabs/VirtualMachines/constants';

import { describe, expect, it } from '@jest/globals';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { criticalConcernFilter, getVmsWithCriticalConcerns, hasCriticalConcern } from '../utils';

const criticalVm = {
  concerns: [{ category: ConcernCategory.Critical, label: 'Shared disk' }],
  id: '1',
  name: 'vm1',
  providerType: PROVIDER_TYPES.vsphere,
} as never;

describe('critical concerns - filtering', () => {
  it('hasCriticalConcern ignores openshift and non-critical concerns', () => {
    expect(hasCriticalConcern(criticalVm)).toBe(true);
    expect(
      hasCriticalConcern({
        ...criticalVm,
        providerType: PROVIDER_TYPES.openshift,
      }),
    ).toBe(false);
    expect(
      hasCriticalConcern({
        concerns: [{ category: ConcernCategory.Warning, label: 'w' }],
        providerType: PROVIDER_TYPES.vsphere,
      } as never),
    ).toBe(false);
  });

  it('getVmsWithCriticalConcerns filters the selection map', () => {
    expect(
      getVmsWithCriticalConcerns({
        a: criticalVm,
        b: { concerns: [], id: '2', providerType: PROVIDER_TYPES.vsphere } as never,
      }),
    ).toEqual({ a: criticalVm });
    expect(getVmsWithCriticalConcerns(undefined as never)).toEqual({});
  });

  it('criticalConcernFilter builds unique critical labels', () => {
    const filter = criticalConcernFilter();
    const dynamic = filter.dynamicFilter?.([
      { vm: { concerns: [{ category: ConcernCategory.Critical, label: 'A' }] } },
      { vm: { concerns: [{ category: ConcernCategory.Critical, label: 'A' }] } },
      { vm: { concerns: [{ category: ConcernCategory.Warning, label: 'B' }] } },
      { vm: { concerns: [] } },
    ]);

    expect(dynamic?.values).toEqual([{ id: 'A', label: 'A' }]);
    expect(filter.placeholderLabel).toMatch(/critical concerns/i);
  });
});
