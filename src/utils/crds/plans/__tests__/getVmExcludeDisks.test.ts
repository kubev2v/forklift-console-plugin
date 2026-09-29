import type { V1beta1PlanSpecVms } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { getVmExcludeDisks } from '@utils/crds/plans/selectors';

describe('getVmExcludeDisks', () => {
  it('returns excludeDisks from VM spec', () => {
    const vm: V1beta1PlanSpecVms = {
      excludeDisks: ['scsi0:1'],
      id: 'vm-1',
      name: 'my-vm',
    };

    expect(getVmExcludeDisks(vm)).toEqual(['scsi0:1']);
  });

  it('returns undefined when field is absent', () => {
    expect(getVmExcludeDisks({ id: 'vm-1', name: 'my-vm' })).toBeUndefined();
  });
});
