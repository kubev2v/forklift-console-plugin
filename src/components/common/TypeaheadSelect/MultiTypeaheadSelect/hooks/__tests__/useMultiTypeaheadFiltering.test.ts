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

  it('shows no-results placeholder when filtering yields no matches', () => {
    const { result } = renderHook(() =>
      useMultiTypeaheadFiltering({
        inputValue: 'zzz',
        isFiltering: true,
        options,
        values: [],
      }),
    );

    expect(result.current.displayOptions).toEqual([
      expect.objectContaining({
        optionProps: { isDisabled: true },
        value: PLACEHOLDER_VALUES.NO_RESULTS,
      }),
    ]);
  });

  it('surfaces a create option when creatable and filter has no exact match', () => {
    const { result } = renderHook(() =>
      useMultiTypeaheadFiltering({
        inputValue: 'Delta',
        isCreatable: true,
        isFiltering: true,
        options,
        values: [],
      }),
    );

    expect(result.current.displayOptions[0]).toEqual(
      expect.objectContaining({
        optionProps: expect.objectContaining({
          testId: 'multi-typeahead-select-create-option',
        }),
        value: 'Delta',
      }),
    );
  });
});
