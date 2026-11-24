import { act, renderHook } from '@testing-library/react';

import { usePageSelection } from '../usePageSelection';

type Item = { id: string };

const toId = (item: Item): string => item.id;

const SELECTED_AB = ['a', 'b'];
const SELECTED_A = ['a'];
const SELECTED_B = ['b'];

describe('usePageSelection - pruneSelection', () => {
  it('removes pruned ids and notifies onSelect once', () => {
    const onSelect = jest.fn();
    const { result } = renderHook(() =>
      usePageSelection<Item>({ onSelect, selectedIds: SELECTED_AB, toId }),
    );

    act(() => {
      result.current.pruneSelection(['a']);
    });

    expect(result.current.internalSelectedIds).toEqual(['b']);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(['b']);
  });

  it('is a no-op when the removed ids are not selected', () => {
    const onSelect = jest.fn();
    const { result } = renderHook(() =>
      usePageSelection<Item>({ onSelect, selectedIds: SELECTED_AB, toId }),
    );

    act(() => {
      result.current.pruneSelection(['ghost']);
    });

    expect(result.current.internalSelectedIds).toEqual(['a', 'b']);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('clears the selection when every id is pruned', () => {
    const onSelect = jest.fn();
    const { result } = renderHook(() =>
      usePageSelection<Item>({ onSelect, selectedIds: SELECTED_AB, toId }),
    );

    act(() => {
      result.current.pruneSelection(['a', 'b']);
    });

    expect(result.current.internalSelectedIds).toEqual([]);
    expect(onSelect).toHaveBeenCalledWith([]);
  });

  it('still resets internal state when the selectedIds prop identity changes', () => {
    const onSelect = jest.fn();
    const { rerender, result } = renderHook(
      ({ selectedIds }: { selectedIds: string[] }): ReturnType<typeof usePageSelection<Item>> =>
        usePageSelection<Item>({ onSelect, selectedIds, toId }),
      { initialProps: { selectedIds: SELECTED_A } },
    );

    rerender({ selectedIds: SELECTED_B });

    expect(result.current.internalSelectedIds).toEqual(['b']);
  });

  it('toggles against the pruned list after a prune', () => {
    const onSelect = jest.fn();
    const { result } = renderHook(() =>
      usePageSelection<Item>({ onSelect, selectedIds: SELECTED_AB, toId }),
    );

    act(() => {
      result.current.pruneSelection(['a']);
    });
    act(() => {
      result.current.toggleSelectFor([{ id: 'c' }]);
    });

    expect(result.current.internalSelectedIds).toEqual(['b', 'c']);
    expect(onSelect).toHaveBeenLastCalledWith(['b', 'c']);
  });
});
