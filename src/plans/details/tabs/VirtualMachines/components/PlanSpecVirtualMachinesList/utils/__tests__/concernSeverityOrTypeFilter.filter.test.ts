import { ConcernCategory } from 'src/providers/details/tabs/VirtualMachines/constants';

import { describe, expect, it } from '@jest/globals';

import { concernSeverityOrTypeFilter } from '../concernSeverityOrTypeFilter';

describe('concernSeverityOrTypeFilter - filter', () => {
  it('builds unique concern and condition values by category', () => {
    const filter = concernSeverityOrTypeFilter();
    const values = filter.dynamicFilter?.([
      {
        conditions: [{ category: ConcernCategory.Warning, type: 'Ready' }],
        inventoryVmData: {
          vm: {
            concerns: [
              { category: ConcernCategory.Critical, label: 'Shared disk' },
              { category: ConcernCategory.Critical, label: 'Shared disk' },
            ],
          },
        },
      },
    ]);

    expect(values?.values?.map((value) => value.id)).toEqual(['Shared disk', 'Ready']);
    expect(filter.type).toBeDefined();
  });
});
