import type { MouseEvent } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook } from '@testing-library/react';

import { useTableColumnWidths } from '../useTableColumnWidths';

const nameField: ResourceField = {
  label: 'Name',
  resourceFieldId: 'name',
  sortable: true,
};

describe('useTableColumnWidths', () => {
  it('omits initial width so DataViewTh measures the rendered column', () => {
    const { result } = renderHook(() =>
      useTableColumnWidths({
        enabled: true,
        visibleColumns: [nameField],
      }),
    );

    expect(result.current.getResizableProps(nameField, 'Name')).toEqual(
      expect.objectContaining({
        isResizable: true,
        minWidth: 100,
      }),
    );
    expect(result.current.getResizableProps(nameField, 'Name')).not.toHaveProperty('width');
  });

  it('applies nowrap and header width from defaults or saved overrides', () => {
    const columnWidthsSettings = {
      clear: jest.fn(),
      data: { name: 240 },
      save: jest.fn(),
    };
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings,
        enabled: true,
        visibleColumns: [nameField],
      }),
    );

    expect(result.current.getColumnHeaderLayoutProps(nameField, 1)).toEqual({
      modifier: 'nowrap',
      style: { width: '240px' },
    });
  });

  it('uses default header width when nothing is saved', () => {
    const { result } = renderHook(() =>
      useTableColumnWidths({
        enabled: true,
        visibleColumns: [nameField],
      }),
    );

    expect(result.current.getColumnHeaderLayoutProps(nameField, 4)).toEqual({
      modifier: 'nowrap',
      style: { width: '300px' },
    });
  });

  it('passes saved width to DataViewTh', () => {
    const columnWidthsSettings = {
      clear: jest.fn(),
      data: { name: 240 },
      save: jest.fn(),
    };
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings,
        enabled: true,
        visibleColumns: [nameField],
      }),
    );

    expect(result.current.getResizableProps(nameField, 'Name')).toMatchObject({ width: 240 });
  });

  it('does not pass width when saved width is only the column minimum', () => {
    const columnWidthsSettings = {
      clear: jest.fn(),
      data: { name: 100 },
      save: jest.fn(),
    };
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings,
        enabled: true,
        visibleColumns: [nameField],
      }),
    );

    expect(result.current.getResizableProps(nameField, 'Name')).not.toHaveProperty('width');
  });

  it('clears persisted width when resize ends at minimum', () => {
    const save = jest.fn();
    const columnWidthsSettings = {
      clear: jest.fn(),
      data: { name: 200 },
      save,
    };
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings,
        enabled: true,
        visibleColumns: [nameField],
      }),
    );

    expect(result.current.columnLayoutKey).toBe(0);
    const props = result.current.getResizableProps(nameField, 'Name');
    act(() => {
      props?.onResize?.({} as MouseEvent, 'name', 100);
    });

    expect(save).toHaveBeenLastCalledWith({});
    expect(result.current.getResizableProps(nameField, 'Name')).not.toHaveProperty('width');
    expect(result.current.columnLayoutKey).toBe(0);
  });
});
