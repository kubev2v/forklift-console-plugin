import type { ResourceField } from '@components/common/utils/types';
import { describe, expect, it } from '@jest/globals';

import { getVisibleColumns, isSecondaryAttributeFilter } from '../utils';

describe('isSecondaryAttributeFilter', () => {
  const baseField: ResourceField = {
    filter: { type: 'enum' },
    label: 'Status',
    resourceFieldId: 'status',
  };

  it('returns true for non-primary, non-standalone, visible filters', () => {
    expect(isSecondaryAttributeFilter(baseField)).toBe(true);
  });

  it('returns false when filter is missing', () => {
    expect(isSecondaryAttributeFilter({ ...baseField, filter: null })).toBe(false);
  });

  it('returns false for primary filters', () => {
    expect(
      isSecondaryAttributeFilter({
        ...baseField,
        filter: { primary: true, type: 'enum' },
      }),
    ).toBe(false);
  });

  it('returns false for standalone filters', () => {
    expect(
      isSecondaryAttributeFilter({
        ...baseField,
        filter: { standalone: true, type: 'enum' },
      }),
    ).toBe(false);
  });

  it('returns false for hidden filters', () => {
    expect(
      isSecondaryAttributeFilter({
        ...baseField,
        filter: { isHidden: true, type: 'enum' },
      }),
    ).toBe(false);
  });
});

describe('getVisibleColumns', () => {
  it('keeps only visible, non-hidden columns', () => {
    const fields: ResourceField[] = [
      { isHidden: false, isVisible: true, label: 'A', resourceFieldId: 'a' },
      { isHidden: true, isVisible: true, label: 'B', resourceFieldId: 'b' },
      { isVisible: false, label: 'C', resourceFieldId: 'c' },
    ];

    expect(getVisibleColumns(fields).map((field) => field.resourceFieldId)).toEqual(['a']);
  });
});
