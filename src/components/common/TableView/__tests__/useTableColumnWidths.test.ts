import type { MouseEvent } from 'react';

import type { ColumnWidthsSettings } from '@components/common/Page/types';
import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook } from '@testing-library/react';

import { COLUMN_WIDTH_PERSIST_DEBOUNCE_MS } from '../columnWidthConstants';
import { useTableColumnWidths } from '../useTableColumnWidths';

type WidthsHookProps = {
  columnWidthsSettings?: ColumnWidthsSettings;
};

const nameField: ResourceField = {
  label: 'Name',
  resourceFieldId: 'name',
  sortable: true,
  width: 25,
};

const projectField: ResourceField = { label: 'Project', resourceFieldId: 'namespace' };

const resizeEvent = {} as MouseEvent;

describe('useTableColumnWidths', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('leaves unsaved widths to DataViewTh rather than imposing pixel defaults', () => {
    const { result } = renderHook(() => useTableColumnWidths({ enabled: true }));

    expect(result.current.getResizableProps(nameField, 'Name')).toEqual(
      expect.objectContaining({ isResizable: true, minWidth: 100 }),
    );
    expect(result.current.getResizableProps(nameField, 'Name')).not.toHaveProperty('width');
    expect(result.current.hasCustomColumnWidths).toBe(false);
  });

  it('passes saved widths, including the minimum, to DataViewTh', () => {
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings: {
          clear: jest.fn(),
          data: { name: 100, namespace: 240 },
          save: jest.fn(),
        },
        enabled: true,
      }),
    );

    expect(result.current.getResizableProps(nameField, 'Name')).toMatchObject({ width: 100 });
    expect(result.current.getResizableProps(projectField, 'Project')).toMatchObject({ width: 240 });
    expect(result.current.hasCustomColumnWidths).toBe(true);
  });

  it('preserves adjacent minimum widths when growing the first column again', () => {
    const save = jest.fn();
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings: { clear: jest.fn(), data: { name: 240 }, save },
        enabled: true,
      }),
    );
    // PatternFly retains the resize callbacks from the initial render.
    const resizeName = result.current.getResizableProps(nameField, 'Name')?.onResize;
    const resizeProject = result.current.getResizableProps(projectField, 'Project')?.onResize;

    act(() => {
      resizeName?.(resizeEvent, 'name', 150);
      resizeProject?.(resizeEvent, 'namespace', 160);
      jest.advanceTimersByTime(COLUMN_WIDTH_PERSIST_DEBOUNCE_MS);
    });
    expect(save).toHaveBeenLastCalledWith({ name: 150, namespace: 160 });

    act(() => {
      resizeName?.(resizeEvent, 'name', 200);
      jest.advanceTimersByTime(COLUMN_WIDTH_PERSIST_DEBOUNCE_MS);
    });
    expect(save).toHaveBeenLastCalledWith({ name: 200, namespace: 160 });
    expect(result.current.getResizableProps(projectField, 'Project')).toMatchObject({ width: 160 });
    expect(result.current.columnLayoutKey).toBe(0);
    expect(result.current.hasCustomColumnWidths).toBe(true);
  });

  it('resets saved widths and remounts the table only on explicit reset', () => {
    const clear = jest.fn();
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings: { clear, data: { name: 100, namespace: 240 }, save: jest.fn() },
        enabled: true,
      }),
    );

    act(() => {
      result.current.resetAllColumnWidths();
    });

    expect(clear).toHaveBeenCalledTimes(1);
    expect(result.current.columnLayoutKey).toBe(1);
    expect(result.current.getResizableProps(nameField, 'Name')).not.toHaveProperty('width');
    expect(result.current.getResizableProps(projectField, 'Project')).not.toHaveProperty('width');
    expect(result.current.hasCustomColumnWidths).toBe(false);
  });

  it('syncs width overrides when persisted settings arrive after mount', () => {
    const initialProps: WidthsHookProps = { columnWidthsSettings: undefined };
    const { result, rerender } = renderHook(
      ({ columnWidthsSettings }: WidthsHookProps) =>
        useTableColumnWidths({
          columnWidthsSettings,
          enabled: true,
        }),
      { initialProps },
    );

    expect(result.current.getResizableProps(nameField, 'Name')).not.toHaveProperty('width');

    rerender({
      columnWidthsSettings: { clear: jest.fn(), data: { name: 180 }, save: jest.fn() },
    });

    expect(result.current.getResizableProps(nameField, 'Name')).toMatchObject({ width: 180 });
  });

  it('does not resize actions or disabled tables', () => {
    const { result, rerender } = renderHook(({ enabled }) => useTableColumnWidths({ enabled }), {
      initialProps: { enabled: false },
    });
    expect(result.current.getResizableProps(nameField, 'Name')).toBeUndefined();

    rerender({ enabled: true });
    expect(
      result.current.getResizableProps(
        { isAction: true, label: 'Actions', resourceFieldId: 'actions' },
        'Actions',
      ),
    ).toBeUndefined();
  });
});
