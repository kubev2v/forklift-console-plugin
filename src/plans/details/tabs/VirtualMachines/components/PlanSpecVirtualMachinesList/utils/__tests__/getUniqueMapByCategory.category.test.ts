import { ConcernCategory } from 'src/providers/details/tabs/VirtualMachines/constants';

import { describe, expect, it } from '@jest/globals';

import { createInitialUniqueMaps, getUniqueMapByCategory } from '../getUniqueMapByCategory';

describe('getUniqueMapByCategory - category', () => {
  it('routes categories to the matching map', () => {
    const maps = createInitialUniqueMaps();
    expect(getUniqueMapByCategory(maps, ConcernCategory.Critical)).toBe(maps.critical);
    expect(getUniqueMapByCategory(maps, ConcernCategory.Warning)).toBe(maps.warning);
    expect(getUniqueMapByCategory(maps, ConcernCategory.Information)).toBe(maps.information);
    expect(getUniqueMapByCategory(maps, 'unknown')).toBe(maps.information);
    expect(getUniqueMapByCategory(maps, 'Warn')).toBe(maps.warning);
    expect(getUniqueMapByCategory(maps, 'Error')).toBe(maps.information);
    expect(getUniqueMapByCategory(maps, 'Advisory')).toBe(maps.information);
  });
});
