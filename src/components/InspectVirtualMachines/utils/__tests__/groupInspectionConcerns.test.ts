import {
  groupInspectionConcernsByCategory,
  ORDERED_INSPECTION_CONCERN_CATEGORIES,
} from '../groupInspectionConcerns';

describe('groupInspectionConcernsByCategory', () => {
  it('exports ordered categories', () => {
    expect(ORDERED_INSPECTION_CONCERN_CATEGORIES).toEqual([
      'Critical',
      'Error',
      'Warning',
      'Advisory',
      'Information',
    ]);
  });

  it('groups concerns by category and preserves insertion order within category', () => {
    const grouped = groupInspectionConcernsByCategory([
      { category: 'Warning', id: '1', label: 'w1', message: 'warning one' },
      { category: 'Critical', id: '2', label: 'c1', message: 'critical one' },
      { category: 'Warning', id: '3', label: 'w2', message: 'warning two' },
    ]);

    expect(grouped.get('Warning')?.map((concern) => concern.id)).toEqual(['1', '3']);
    expect(grouped.get('Critical')?.map((concern) => concern.id)).toEqual(['2']);
    expect(grouped.get('Error')).toBeUndefined();
  });

  it('returns an empty map for empty input', () => {
    expect(groupInspectionConcernsByCategory([])).toEqual(new Map());
  });
});
