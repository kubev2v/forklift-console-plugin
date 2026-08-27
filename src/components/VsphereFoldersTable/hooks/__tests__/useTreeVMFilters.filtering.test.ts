import { renderHook } from '@testing-library/react';

import type { AttributeFilters } from '../../components/AttributeFilter/hooks/useAttributeFilters';
import type { VmRow } from '../../utils/types';
import useTreeFilters from '../useTreeVMFilters';
import { FOLDER_PREFIX, NO_FOLDER } from '../utils/constants';

import { concerns, folder, folderTreeRows, vm } from './rowFixtures';

const filtersStub = (overrides: Partial<AttributeFilters<VmRow>> = {}): AttributeFilters<VmRow> =>
  ({
    hasAttrFilters: false,
    predicate: () => true,
    ...overrides,
  }) as AttributeFilters<VmRow>;

describe('useTreeVMFilters - filtering', () => {
  it('returns all rows when showAll and no attribute filters', () => {
    const { result } = renderHook(() =>
      useTreeFilters({ filters: filtersStub(), rows: folderTreeRows, showAll: true }),
    );

    expect(result.current.filteredRows).toBe(folderTreeRows);
    expect(result.current.visibleVmIds.size).toBe(0);
  });

  it('filters VMs by predicate and attaches visible concerns', () => {
    const { result } = renderHook(() =>
      useTreeFilters({
        filters: filtersStub({
          hasAttrFilters: true,
          predicate: (row) => row.vmData.name === 'vm-1',
        }),
        rows: folderTreeRows,
        showAll: true,
      }),
    );

    expect(result.current.filteredRows.map((row) => row.key)).toEqual([
      `${FOLDER_PREFIX}a`,
      'vm-vm-1',
      'concerns-vm-1',
    ]);
    expect(result.current.visibleVmIds.has('vm-1')).toBe(true);
    expect(result.current.filteredGroupVMCountByFolder.get('a')).toBe(1);
  });

  it('skips hidden concerns rows', () => {
    const rows = [folder('a'), vm('vm-2'), concerns('vm-2', { isHidden: true })];
    const { result } = renderHook(() =>
      useTreeFilters({
        filters: filtersStub({
          hasAttrFilters: true,
          predicate: (row) => row.vmData.name === 'vm-2',
        }),
        rows,
        showAll: true,
      }),
    );

    expect(result.current.filteredRows.map((row) => row.key)).toEqual([
      `${FOLDER_PREFIX}a`,
      'vm-vm-2',
    ]);
  });

  it('returns empty filtered rows for empty input', () => {
    const { result } = renderHook(() =>
      useTreeFilters({
        filters: filtersStub({ hasAttrFilters: true }),
        rows: [],
        showAll: true,
      }),
    );

    expect(result.current.filteredRows).toEqual([]);
    expect(result.current.visibleVmIds.size).toBe(0);
  });

  it('when showAll is false, only selected VMs pass', () => {
    const { result } = renderHook(() =>
      useTreeFilters({ filters: filtersStub(), rows: folderTreeRows, showAll: false }),
    );

    expect(result.current.filteredRows.map((row) => row.key)).toEqual([
      `${FOLDER_PREFIX}a`,
      'vm-vm-1',
      'concerns-vm-1',
      `${FOLDER_PREFIX}b`,
      'vm-vm-3',
      'concerns-vm-3',
    ]);
    expect(result.current.visibleVmIds.has('root-1')).toBe(false);
  });

  it('intersects showAll false with attribute predicate', () => {
    const { result } = renderHook(() =>
      useTreeFilters({
        filters: filtersStub({
          hasAttrFilters: true,
          predicate: (row) => row.vmData.name === 'vm-3',
        }),
        rows: folderTreeRows,
        showAll: false,
      }),
    );

    // selected vm-1 fails predicate; selected vm-3 passes
    expect(result.current.filteredRows.map((row) => row.key)).toEqual([
      `${FOLDER_PREFIX}b`,
      'vm-vm-3',
      'concerns-vm-3',
    ]);
    expect(result.current.visibleVmIds.has('vm-1')).toBe(false);
    expect(result.current.visibleVmIds.has('vm-3')).toBe(true);
  });

  it('counts root VMs under no-folder key', () => {
    const { result } = renderHook(() =>
      useTreeFilters({
        filters: filtersStub({
          hasAttrFilters: true,
          predicate: (row) => row.vmData.name === 'root-1',
        }),
        rows: folderTreeRows,
        showAll: true,
      }),
    );

    expect(result.current.filteredRows.map((row) => row.key)).toEqual([
      'vm-root-1',
      'concerns-root-1',
    ]);
    expect(result.current.filteredGroupVMCountByFolder.get(NO_FOLDER)).toBe(1);
  });
});
