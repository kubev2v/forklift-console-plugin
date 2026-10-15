import type { ResourceField } from '@components/common/utils/types';

import { filterActionsAndHidden, sameOrderAndVisibility } from '../manageColumnsUtils';

const col = (id: string, isVisible = true): ResourceField => ({
  isVisible,
  label: id,
  resourceFieldId: id,
});

describe('manageColumnsUtils', () => {
  it('filters out actions, hidden fields and columns without IDs', () => {
    const name = col('name');
    const status = col('status', false);
    const fields = [
      name,
      status,
      { ...col('actions'), isAction: true },
      { ...col('internal'), isHidden: true },
      { label: 'Placeholder', resourceFieldId: null },
    ];

    expect(filterActionsAndHidden(fields)).toEqual([name, status]);
  });

  it('matches equivalent column IDs, order and visibility', () => {
    const columns = [col('name'), col('status')];
    const updatedLabels = columns.map((field) => ({ ...field, label: 'Updated label' }));

    expect(sameOrderAndVisibility(columns, updatedLabels)).toBe(true);
  });

  it('detects reordering', () => {
    expect(sameOrderAndVisibility([col('name'), col('status')], [col('status'), col('name')])).toBe(
      false,
    );
  });

  it('detects changed visibility', () => {
    expect(
      sameOrderAndVisibility([col('name'), col('status')], [col('name'), col('status', false)]),
    ).toBe(false);
  });

  it('detects a changed column ID', () => {
    expect(sameOrderAndVisibility([col('name')], [col('status')])).toBe(false);
  });

  it('detects a changed column count', () => {
    expect(sameOrderAndVisibility([col('name')], [col('name'), col('status')])).toBe(false);
  });

  it('matches empty column lists', () => {
    expect(sameOrderAndVisibility([], [])).toBe(true);
  });
});
