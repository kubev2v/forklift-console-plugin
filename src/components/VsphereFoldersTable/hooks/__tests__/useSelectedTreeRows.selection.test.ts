import type { FormEvent } from 'react';

import { act, renderHook } from '@testing-library/react';

import useSelectedTreeRows from '../useSelectedTreeRows';

describe('useSelectedTreeRows - selection', () => {
  it('starts with empty selection and showAll true', () => {
    const { result } = renderHook(() => useSelectedTreeRows());

    expect(result.current.selectedVmKeys).toEqual([]);
    expect(result.current.selectedSet.size).toBe(0);
    expect(result.current.showAll).toBe(true);
  });

  it('adds and removes a single key via onCheckChange', () => {
    const { result } = renderHook(() => useSelectedTreeRows());
    const event = {} as FormEvent<HTMLInputElement>;

    act(() => {
      result.current.onCheckChange('vm-1')(event, true);
    });
    expect(result.current.selectedVmKeys).toEqual(['vm-1']);
    expect(result.current.selectedSet.has('vm-1')).toBe(true);

    act(() => {
      result.current.onCheckChange('vm-1')(event, false);
    });
    expect(result.current.selectedVmKeys).toEqual([]);
  });

  it('adds and removes multiple keys via onCheckChange', () => {
    const { result } = renderHook(() => useSelectedTreeRows());
    const event = {} as FormEvent<HTMLInputElement>;

    act(() => {
      result.current.onCheckChange(['vm-1', 'vm-2'])(event, true);
    });
    expect(result.current.selectedVmKeys).toEqual(expect.arrayContaining(['vm-1', 'vm-2']));
    expect(result.current.selectedVmKeys).toHaveLength(2);

    act(() => {
      result.current.onCheckChange(['vm-1'])(event, false);
    });
    expect(result.current.selectedVmKeys).toEqual(['vm-2']);
  });

  it('supports functional setSelectedVmKeys updater', () => {
    const { result } = renderHook(() => useSelectedTreeRows());

    act(() => {
      result.current.setSelectedVmKeys(['vm-1']);
    });
    act(() => {
      result.current.setSelectedVmKeys((prev) => [...prev, 'vm-2']);
    });

    expect(result.current.selectedVmKeys).toEqual(['vm-1', 'vm-2']);
  });

  it('toggles showAll via setShowAll', () => {
    const { result } = renderHook(() => useSelectedTreeRows());

    act(() => {
      result.current.setShowAll(false);
    });
    expect(result.current.showAll).toBe(false);
  });
});
