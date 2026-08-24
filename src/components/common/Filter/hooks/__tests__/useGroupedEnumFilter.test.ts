import { act, renderHook } from '@testing-library/react';

import { useGroupedEnumFilter } from '../useGroupedEnumFilter';

const supportedValues = [
  { groupId: 'g1', id: 'a', label: 'A', resourceFieldId: 'field-1' },
  { groupId: 'g1', id: 'b', label: 'B', resourceFieldId: 'field-1' },
  { groupId: 'g2', id: 'c', label: 'C', resourceFieldId: 'field-2' },
];

describe('useGroupedEnumFilter', () => {
  it('calls onFilterUpdate once when deleting with hasMultipleResources', () => {
    const onFilterUpdate = jest.fn();
    const { result } = renderHook(() =>
      useGroupedEnumFilter({
        hasMultipleResources: true,
        onFilterUpdate,
        selectedFilters: ['a', 'b', 'c'],
        supportedValues,
      }),
    );

    act(() => {
      result.current.deleteFilter('a');
    });

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate).toHaveBeenCalledWith(['b'], 'field-1');
  });

  it('calls onFilterUpdate once when adding with hasMultipleResources', () => {
    const onFilterUpdate = jest.fn();
    const { result } = renderHook(() =>
      useGroupedEnumFilter({
        hasMultipleResources: true,
        onFilterUpdate,
        selectedFilters: ['a'],
        supportedValues,
      }),
    );

    act(() => {
      result.current.onSelect(undefined, 'B');
    });

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate).toHaveBeenCalledWith(['a', 'b'], 'field-1');
  });
});
