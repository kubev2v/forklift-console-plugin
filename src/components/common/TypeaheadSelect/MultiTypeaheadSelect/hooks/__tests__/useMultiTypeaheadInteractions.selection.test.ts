import { createRef } from 'react';
import { act, renderHook } from '@testing-library/react-hooks';

import { PLACEHOLDER_VALUES } from '../../../utils/constants';
import { useMultiTypeaheadInteractions } from '../useMultiTypeaheadInteractions';

const options = [
  { content: 'One', value: '1' },
  { content: 'Two', value: '2' },
  { content: 'Three', value: '3' },
];

describe('useMultiTypeaheadInteractions - selection', () => {
  const setup = (values: (string | number)[] = [], extras: Record<string, unknown> = {}) => {
    const onChange = jest.fn();
    const resetFilter = jest.fn();
    const setIsOpen = jest.fn();
    const inputRef = createRef<HTMLInputElement>();
    (inputRef as { current: HTMLInputElement | null }).current = { focus: jest.fn() } as never;

    const hook = renderHook(() =>
      useMultiTypeaheadInteractions({
        displayOptions: options,
        inputRef,
        isOpen: true,
        onChange,
        options,
        resetFilter,
        setIsOpen,
        values,
        ...extras,
      }),
    );

    return { ...hook, onChange, resetFilter, setIsOpen };
  };

  it('toggles values on and off', () => {
    const { result, onChange } = setup(['1']);
    act(() => result.current.toggleSelectValue('2'));
    expect(onChange).toHaveBeenCalledWith(['1', '2']);

    act(() => result.current.toggleSelectValue('1'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('respects maxSelections', () => {
    const { result, onChange } = setup(['1'], { maxSelections: 1 });
    act(() => result.current.toggleSelectValue('2'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('handleSelect ignores placeholder and undefined', () => {
    const { result, onChange } = setup();
    act(() => result.current.handleSelect(undefined));
    act(() => result.current.handleSelect(PLACEHOLDER_VALUES.NO_OPTIONS));
    act(() => result.current.handleSelect(PLACEHOLDER_VALUES.NO_RESULTS));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('handleSelect creates option when creatable', () => {
    const onCreateOption = jest.fn();
    const { result, onChange, resetFilter } = setup([], { isCreatable: true, onCreateOption });
    act(() => result.current.handleSelect('new'));
    expect(onCreateOption).toHaveBeenCalledWith('new');
    expect(onChange).toHaveBeenCalledWith(['new']);
    expect(resetFilter).toHaveBeenCalled();
  });

  it('removes chips and clears all', () => {
    const { result, onChange } = setup(['1', '2']);
    act(() => result.current.onChipRemove('1'));
    expect(onChange).toHaveBeenCalledWith(['2']);
    act(() => result.current.onClearAll());
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('sets and resets focused item', () => {
    const { result } = setup();
    act(() => result.current.setActiveAndFocusedItem(1));
    expect(result.current.focusedItemIndex).toBe(1);
    expect(result.current.activeItemId).toContain('2');
    act(() => result.current.resetFocus());
    expect(result.current.focusedItemIndex).toBeNull();
    expect(result.current.activeItemId).toBeNull();
  });
});
