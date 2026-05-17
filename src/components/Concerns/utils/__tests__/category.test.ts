import type { Concern, V1beta1PlanStatusConditions } from '@forklift-ui/types';

import { groupConcernsByCategory, groupConditionsByCategory } from '../category';
import { orderedConcernCategories } from '../constants';

describe('groupConcernsByCategory', () => {
  it('returns an entry for every category in orderedConcernCategories', () => {
    const grouped = groupConcernsByCategory([]);

    for (const category of orderedConcernCategories) {
      expect(grouped[category]).toBeDefined();
      expect(Array.isArray(grouped[category])).toBe(true);
    }
  });

  it('groups concerns by their category', () => {
    const concerns = [
      { assessment: 'a', category: 'Critical', label: 'c1' },
      { assessment: 'b', category: 'Warning', label: 'w1' },
      { assessment: 'c', category: 'Critical', label: 'c2' },
    ] as Concern[];

    const grouped = groupConcernsByCategory(concerns);

    expect(grouped.Critical).toHaveLength(2);
    expect(grouped.Warning).toHaveLength(1);
    expect(grouped.Information).toHaveLength(0);
    expect(grouped.Error).toHaveLength(0);
    expect(grouped.Advisory).toHaveLength(0);
  });

  it('handles undefined input without crashing', () => {
    const grouped = groupConcernsByCategory(undefined as unknown as Concern[]);

    for (const category of orderedConcernCategories) {
      expect(grouped[category]).toBeDefined();
    }
  });
});

describe('groupConditionsByCategory', () => {
  it('returns an entry for every category in orderedConcernCategories', () => {
    const grouped = groupConditionsByCategory([]);

    for (const category of orderedConcernCategories) {
      expect(grouped[category]).toBeDefined();
      expect(Array.isArray(grouped[category])).toBe(true);
    }
  });

  it('maps Warn category to Warning via getCategoryLabel', () => {
    const conditions = [
      { category: 'Warn', message: 'test', type: 'WarnType' },
    ] as V1beta1PlanStatusConditions[];

    const grouped = groupConditionsByCategory(conditions);

    expect(grouped.Warning).toHaveLength(1);
  });

  it('handles undefined input without crashing', () => {
    const grouped = groupConditionsByCategory(
      undefined as unknown as V1beta1PlanStatusConditions[],
    );

    for (const category of orderedConcernCategories) {
      expect(grouped[category]).toBeDefined();
    }
  });
});

describe('orderedConcernCategories iteration safety', () => {
  it('accessing .length on every grouped category never throws', () => {
    const groupedConcerns = groupConcernsByCategory([]);
    const groupedConditions = groupConditionsByCategory([]);

    expect(() => {
      orderedConcernCategories.forEach(
        (category) => groupedConcerns[category].length + groupedConditions[category].length,
      );
    }).not.toThrow();
  });
});
