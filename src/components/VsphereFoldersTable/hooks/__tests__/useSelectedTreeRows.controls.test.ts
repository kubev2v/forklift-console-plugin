import { act, renderHook } from '@testing-library/react';

import useSelectedTreeRows from '../useSelectedTreeRows';

describe('useSelectedTreeRows - controls', () => {
  it('reads selectedVmKeys from controls when provided', () => {
    const setSelectedVmKeys = jest.fn();
    const { result } = renderHook(() =>
      useSelectedTreeRows({ selectedVmKeys: ['vm-a'], setSelectedVmKeys }),
    );

    expect(result.current.selectedVmKeys).toEqual(['vm-a']);
    expect(result.current.selectedSet.has('vm-a')).toBe(true);
  });

  it('delegates setSelectedVmKeys to controls', () => {
    const setSelectedVmKeys = jest.fn();
    const { result } = renderHook(() =>
      useSelectedTreeRows({ selectedVmKeys: [], setSelectedVmKeys }),
    );

    act(() => {
      result.current.setSelectedVmKeys(['vm-1']);
    });

    expect(setSelectedVmKeys).toHaveBeenCalledWith(['vm-1']);
  });

  it('resets showAll when controlled selection becomes empty', () => {
    const setSelectedVmKeys = jest.fn();
    const { result } = renderHook(() =>
      useSelectedTreeRows({ selectedVmKeys: ['vm-1'], setSelectedVmKeys }),
    );

    act(() => {
      result.current.setShowAll(false);
    });
    expect(result.current.showAll).toBe(false);

    act(() => {
      result.current.setSelectedVmKeys([]);
    });

    expect(result.current.showAll).toBe(true);
    expect(setSelectedVmKeys).toHaveBeenCalledWith([]);
  });

  it('does not reset showAll when clearing uncontrolled selection', () => {
    const { result } = renderHook(() => useSelectedTreeRows());

    act(() => {
      result.current.setSelectedVmKeys(['vm-1']);
      result.current.setShowAll(false);
    });
    act(() => {
      result.current.setSelectedVmKeys([]);
    });

    expect(result.current.selectedVmKeys).toEqual([]);
    expect(result.current.showAll).toBe(false);
  });

  it('resolves functional updater against controls.selectedVmKeys', () => {
    const setSelectedVmKeys = jest.fn();
    const { result } = renderHook(() =>
      useSelectedTreeRows({ selectedVmKeys: ['vm-1'], setSelectedVmKeys }),
    );

    act(() => {
      result.current.setSelectedVmKeys((prev) => [...prev, 'vm-2']);
    });

    expect(setSelectedVmKeys).toHaveBeenCalledWith(['vm-1', 'vm-2']);
  });
});
