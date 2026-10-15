import type { MouseEvent } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook } from '@testing-library/react';

import type { ColumnWidthsSettings } from '../../Page/types';
import { COLUMN_WIDTH_PERSIST_DEBOUNCE_MS } from '../columnWidthConstants';
import { useTableColumnWidths } from '../useTableColumnWidths';

type VisibilityTestProps = {
  columnWidthsSettings: ColumnWidthsSettings & {
    clear: jest.Mock;
    data: Record<string, number>;
    save: jest.Mock;
  };
};

const nameField: ResourceField = { label: 'Name', resourceFieldId: 'name' };
const statusField: ResourceField = { label: 'Status', resourceFieldId: 'status' };
const projectField: ResourceField = { label: 'Project', resourceFieldId: 'namespace' };
const resizeEvent = {} as MouseEvent;

describe('useTableColumnWidths column visibility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('preserves widths by ID when resizing and restoring columns from settings', () => {
    const clear = jest.fn();
    const save = jest.fn();
    const columnWidthsSettings = (
      data: Record<string, number>,
    ): VisibilityTestProps['columnWidthsSettings'] => ({ clear, data, save });

    const { result, rerender } = renderHook(
      ({ columnWidthsSettings: settings }: VisibilityTestProps) =>
        useTableColumnWidths({
          columnWidthsSettings: settings,
          enabled: true,
        }),
      {
        initialProps: {
          columnWidthsSettings: columnWidthsSettings({ name: 624.125, status: 79.125 }),
        },
      },
    );

    rerender({
      columnWidthsSettings: columnWidthsSettings({ name: 624.125, status: 79.125 }),
    });
    expect(result.current.getResizableProps(nameField, 'Name')).toMatchObject({ width: 624.125 });
    expect(result.current.getResizableProps(projectField, 'Project')).not.toHaveProperty('width');
    expect(save).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();

    act(() => {
      result.current
        .getResizableProps(projectField, 'Project')
        ?.onResize?.(resizeEvent, 'namespace', 160);
      jest.advanceTimersByTime(COLUMN_WIDTH_PERSIST_DEBOUNCE_MS);
    });
    expect(save).toHaveBeenLastCalledWith({ name: 624.125, namespace: 160, status: 79.125 });

    rerender({
      columnWidthsSettings: columnWidthsSettings({
        name: 624.125,
        namespace: 160,
        status: 79.125,
      }),
    });
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
