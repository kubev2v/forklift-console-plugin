import { renderHook } from '@testing-library/react';

import { PLACEHOLDER_VALUES } from '../../../utils/constants';
import { useMultiTypeaheadFiltering } from '../useMultiTypeaheadFiltering';

const options = [
  { content: 'Alpha', value: 'a' },
  { content: 'Beta', value: 'b' },
  { content: 'Gamma', value: 'c' },
];

describe('useMultiTypeaheadFiltering', () => {
  it('maps selected values to options and synthesizes missing ones', () => {
    const { result } = renderHook(() =>
      useMultiTypeaheadFiltering({
        inputValue: '',
        isFiltering: false,
        options,
        values: ['a', 'missing'],
      }),
    );

    expect(result.current.selectedOptions).toEqual([
      { content: 'Alpha', value: 'a' },
      { content: 'missing', value: 'missing' },
    ]);
  });

  it('shows no-options placeholder when options are empty and not filtering', () => {
    const { result } = renderHook(() =>
      useMultiTypeaheadFiltering({
        inputValue: '',
        isFiltering: false,
        options: [],
        values: [],
      }),
    );

    expect(result.current.displayOptions).toEqual([
      expect.objectContaining({
        optionProps: { isDisabled: true },
        value: PLACEHOLDER_VALUES.NO_OPTIONS,
      }),
    ]);
  });

  it('filters options when filtering', () => {
    const { result } = renderHook(() =>
      useMultiTypeaheadFiltering({
        inputValue: 'be',
        isFiltering: true,
        options,
        values: [],
      }),
    );

    expect(result.current.displayOptions.map((option) => option.value)).toEqual(['b']);
  });
});
