import type { ResourceField } from '@components/common/utils/types';

import { sameVisibleColumnSet } from '../manageColumnsUtils';

const col = (id: string, isVisible = true): ResourceField => ({
  isVisible,
  label: id,
  resourceFieldId: id,
});

describe('manageColumnsUtils', () => {
  it('sameVisibleColumnSet ignores column order', () => {
    const a = [col('name'), col('status')];
    const b = [col('status'), col('name')];
    expect(sameVisibleColumnSet(a, b)).toBe(true);
  });

  it('sameVisibleColumnSet is false when visibility differs', () => {
    const a = [col('name'), col('status')];
    const b = [col('name'), col('status', false)];
    expect(sameVisibleColumnSet(a, b)).toBe(false);
  });
});
