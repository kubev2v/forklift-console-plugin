import { describe, expect, it } from '@jest/globals';

import { pruneSelectedIds } from '../utils';

describe('pruneSelectedIds', () => {
  it('keeps visible ids in input order and drops hidden ones', () => {
    expect(pruneSelectedIds(['3', '1', '9'], ['1', '2', '3'])).toEqual(['3', '1']);
  });

  it('returns the same array reference when nothing is pruned', () => {
    const selectedIds = ['1', '2'];

    expect(pruneSelectedIds(selectedIds, ['1', '2', '3'])).toBe(selectedIds);
  });

  it('returns an empty array for an empty selection', () => {
    expect(pruneSelectedIds([], ['1'])).toEqual([]);
  });

  it('drops every id when nothing is visible', () => {
    expect(pruneSelectedIds(['1', '2'], [])).toEqual([]);
  });

  it('tolerates duplicate and unknown ids', () => {
    expect(pruneSelectedIds(['1', '1', 'ghost'], ['1'])).toEqual(['1', '1']);
  });
});
