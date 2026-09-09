import { act, renderHook } from '@testing-library/react';

import { PLACEHOLDER_VALUES } from '../../../utils/constants';
import { useMultiTypeaheadSelect } from '../useMultiTypeaheadSelect';

const options = [
  { content: 'One', value: '1' },
  { content: 'Two', value: '2' },
];

describe('useMultiTypeaheadSelect', () => {
  it('exposes filtering and open state with default listbox id', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useMultiTypeaheadSelect({ onChange, options, values: ['1'] }),
    );

    expect(result.current.listboxId).toBe('select-multi-typeahead-listbox');
    expect(result.current.selectedOptions).toEqual([options[0]]);
    expect(result.current.isOpen).toBe(false);
  });

  it('opens on toggle and selects values through handleSelect', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useMultiTypeaheadSelect({ onChange, options, values: [] }));

    act(() => {
      result.current.onToggleClick();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.handleSelect('2');
    });
    expect(onChange).toHaveBeenCalledWith(['2']);
  });

  it('deselects an already selected value through handleSelect', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useMultiTypeaheadSelect({ onChange, options, values: ['2'] }),
    );

    act(() => {
      result.current.handleSelect('2');
    });
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('ignores placeholder values in handleSelect', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useMultiTypeaheadSelect({ onChange, options, values: [] }));

    act(() => {
      result.current.handleSelect(PLACEHOLDER_VALUES.NO_RESULTS);
    });
    act(() => {
      result.current.handleSelect(PLACEHOLDER_VALUES.NO_OPTIONS);
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
