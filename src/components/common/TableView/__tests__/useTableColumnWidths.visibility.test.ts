import type { MouseEvent } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook } from '@testing-library/react';

import { useTableColumnWidths } from '../useTableColumnWidths';

const nameField: ResourceField = { label: 'Name', resourceFieldId: 'name' };
const statusField: ResourceField = { label: 'Status', resourceFieldId: 'status' };
const projectField: ResourceField = { label: 'Project', resourceFieldId: 'namespace' };
const resizeEvent = {} as MouseEvent;

describe('useTableColumnWidths column visibility', () => {
  it('preserves widths by ID across hiding, adding, resizing and restoring columns', () => {
    const clear = jest.fn();
    const save = jest.fn();
    const { result, rerender } = renderHook(
      ({ visibleColumns }: { visibleColumns: ResourceField[] }) =>
        useTableColumnWidths({
          columnWidthsSettings: { clear, data: { name: 624.125, status: 79.125 }, save },
          enabled: true,
          visibleColumns,
        }),
      { initialProps: { visibleColumns: [nameField, statusField] } },
    );

    rerender({ visibleColumns: [nameField, projectField] });
    expect(result.current.getResizableProps(nameField, 'Name')).toMatchObject({ width: 624.125 });
    expect(result.current.getResizableProps(projectField, 'Project')).not.toHaveProperty('width');
    expect(save).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();

    act(() => {
      result.current
        .getResizableProps(projectField, 'Project')
        ?.onResize?.(resizeEvent, 'namespace', 160);
    });
    expect(save).toHaveBeenLastCalledWith({ name: 624.125, namespace: 160, status: 79.125 });

    rerender({ visibleColumns: [projectField, statusField, nameField] });
    expect(result.current.getResizableProps(nameField, 'Name')).toMatchObject({ width: 624.125 });
    expect(result.current.getResizableProps(statusField, 'Status')).toMatchObject({
      width: 79.125,
    });
    expect(result.current.getResizableProps(projectField, 'Project')).toMatchObject({ width: 160 });
    expect(result.current.columnLayoutKey).toBe(0);
    expect(result.current.hasCustomColumnWidths).toBe(true);
    expect(clear).not.toHaveBeenCalled();
  });
});
