import { ConcernCategory } from 'src/providers/details/tabs/VirtualMachines/constants';

import { describe, expect, it } from '@jest/globals';

import { getCriticalConcernsVmsMap, mergeConcernsMaps } from '../utils';

describe('plan details utils - concerns maps', () => {
  it('counts critical inventory concerns by label', () => {
    const map = getCriticalConcernsVmsMap([
      {
        inventoryVmData: {
          vm: {
            concerns: [
              { category: ConcernCategory.Critical, label: 'Shared disk' },
              { category: ConcernCategory.Warning, label: 'warn' },
            ],
          },
        },
      },
      {
        inventoryVmData: {
          vm: { concerns: [{ category: ConcernCategory.Critical, label: 'Shared disk' }] },
        },
      },
    ] as never);

    expect(map.get('Shared disk')).toBe(2);
    expect(map.has('warn')).toBe(false);
  });

  it('merges maps preferring the larger count', () => {
    const merged = mergeConcernsMaps(
      new Map([
        ['a', 1],
        ['b', 5],
      ]),
      new Map([
        ['a', 3],
        ['c', 2],
      ]),
    );

    expect(Object.fromEntries(merged)).toEqual({ a: 3, b: 5, c: 2 });
  });
});
