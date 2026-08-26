import { act, renderHook } from '@testing-library/react-hooks';

import { useMultiTypeaheadOpen } from '../useMultiTypeaheadOpen';

describe('useMultiTypeaheadOpen - behavior', () => {
  it('starts closed with empty input', () => {
    const { result } = renderHook(() => useMultiTypeaheadOpen({}));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.inputValue).toBe('');
    expect(result.current.isFiltering).toBe(false);
  });

  it('toggles open state and focuses input', () => {
    const { result } = renderHook(() => useMultiTypeaheadOpen({}));
    const focus = jest.fn();
    (result.current.inputRef as { current: HTMLInputElement | null }).current = {
      focus,
    } as HTMLInputElement;

    act(() => result.current.onToggleClick());
    expect(result.current.isOpen).toBe(true);
    expect(focus).toHaveBeenCalled();

    act(() => result.current.onToggleClick());
    expect(result.current.isOpen).toBe(false);
  });

  it('opens on input click when closed and closes when empty while open', () => {
    const { result } = renderHook(() => useMultiTypeaheadOpen({}));

    act(() => result.current.onInputClick());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.onInputClick());
    expect(result.current.isOpen).toBe(false);
  });

  it('updates input value, filtering flag and optional callback', () => {
    const onInputChange = jest.fn();
    const { result } = renderHook(() => useMultiTypeaheadOpen({ onInputChange }));

    act(() => result.current.onInputValueChange('abc', true));
    expect(result.current.inputValue).toBe('abc');
    expect(result.current.isFiltering).toBe(true);
    expect(onInputChange).toHaveBeenCalledWith('abc');
  });

  it('resets filter when closing via onOpenChange', () => {
    const { result } = renderHook(() => useMultiTypeaheadOpen({}));
    act(() => result.current.onInputValueChange('x', true));
    act(() => result.current.onOpenChange(true));
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.onOpenChange(false));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.inputValue).toBe('');
    expect(result.current.isFiltering).toBe(false);
  });
});
