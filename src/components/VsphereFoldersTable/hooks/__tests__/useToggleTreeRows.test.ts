import { act, renderHook } from '@testing-library/react';

import useToggleTreeRows from '../useToggleTreeRows';

describe('useToggleTreeRows', () => {
  it('starts with empty expansion sets', () => {
    const { result } = renderHook(() => useToggleTreeRows());
    expect(result.current.expandedFolders.size).toBe(0);
    expect(result.current.expandedVMs.size).toBe(0);
  });

  it('toggles ids into and out of a set', () => {
    const { result } = renderHook(() => useToggleTreeRows());

    act(() => {
      result.current.toggleSet<string>(result.current.setExpandedFolders, 'folder-a');
    });
    expect(result.current.expandedFolders.has('folder-a')).toBe(true);

    act(() => {
      result.current.toggleSet<string>(result.current.setExpandedFolders, 'folder-a');
    });
    expect(result.current.expandedFolders.has('folder-a')).toBe(false);
  });

  it('supports independent folder and VM expansion sets', () => {
    const { result } = renderHook(() => useToggleTreeRows());

    act(() => {
      result.current.toggleSet<string>(result.current.setExpandedFolders, 'folder-a');
      result.current.toggleSet<string>(result.current.setExpandedVMs, 'vm-1');
    });

    expect([...result.current.expandedFolders]).toEqual(['folder-a']);
    expect([...result.current.expandedVMs]).toEqual(['vm-1']);
  });
});
