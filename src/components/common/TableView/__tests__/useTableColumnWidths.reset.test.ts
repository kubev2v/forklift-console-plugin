import type { MouseEvent } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook, type RenderHookResult } from '@testing-library/react';

import { COLUMN_WIDTH_PERSIST_DEBOUNCE_MS } from '../columnWidthConstants';
import { useTableColumnWidths } from '../useTableColumnWidths';

const nameField: ResourceField = { label: 'Name', resourceFieldId: 'name' };
const resizeEvent = {} as MouseEvent;

type RenderWidthsResult = RenderHookResult<ReturnType<typeof useTableColumnWidths>, unknown> & {
  clear: jest.Mock<undefined, []>;
  save: jest.Mock<undefined, [Record<string, number>]>;
};

const renderWidths = (data: Record<string, number> = {}): RenderWidthsResult => {
  const clear = jest.fn<undefined, []>();
  const save = jest.fn<undefined, [Record<string, number>]>();
  const view = renderHook(() =>
    useTableColumnWidths({
      columnWidthsSettings: { clear, data, save },
      enabled: true,
    }),
  );
  return { ...view, clear, save };
};

describe('column width reset', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does nothing when widths are already at their defaults', () => {
    const { clear, result } = renderWidths();

    act(() => {
      result.current.resetAllColumnWidths();
    });

    expect(clear).not.toHaveBeenCalled();
    expect(result.current.columnLayoutKey).toBe(0);
  });

  it('clears saved minimum widths once, including batched repeated resets', () => {
    const { clear, result } = renderWidths({ name: 100 });

    act(() => {
      result.current.resetAllColumnWidths();
      result.current.resetAllColumnWidths();
    });

    expect(clear).toHaveBeenCalledTimes(1);
    expect(result.current.columnLayoutKey).toBe(1);
    expect(result.current.getResizableProps(nameField, 'Name')).not.toHaveProperty('width');
  });

  it('does not persist queued resize updates after a reset in the same batch', () => {
    const { clear, result, save } = renderWidths({ name: 100 });
    let storedWidths: Record<string, number> = { name: 100 };
    save.mockImplementation((widths): undefined => {
      storedWidths = widths;
      return undefined;
    });
    clear.mockImplementation((): undefined => {
      storedWidths = {};
      return undefined;
    });
    const resize = result.current.getResizableProps(nameField, 'Name')?.onResize;

    act(() => {
      resize?.(resizeEvent, 'name', 200);
      jest.advanceTimersByTime(COLUMN_WIDTH_PERSIST_DEBOUNCE_MS);
    });
    act(() => {
      resize?.(resizeEvent, 'name', 240);
      jest.advanceTimersByTime(COLUMN_WIDTH_PERSIST_DEBOUNCE_MS);
      result.current.resetAllColumnWidths();
    });

    expect(save).toHaveBeenCalledTimes(2);
    expect(storedWidths).toEqual({});
    expect(result.current.getResizableProps(nameField, 'Name')).not.toHaveProperty('width');
  });

  it('keeps overrides when persistence clear fails', () => {
    const clear = jest.fn((): void => {
      throw new Error('storage failed');
    });
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings: { clear, data: { name: 100 }, save: jest.fn() },
        enabled: true,
      }),
    );

    expect(() => {
      act(() => {
        result.current.resetAllColumnWidths();
      });
    }).toThrow('storage failed');
    expect(result.current.getResizableProps(nameField, 'Name')).toMatchObject({ width: 100 });
    expect(result.current.columnLayoutKey).toBe(0);
  });

  it('keeps the reset handler stable and responsive to later resizes', () => {
    const { clear, result } = renderWidths();
    const reset = result.current.resetAllColumnWidths;

    act(() => {
      result.current.getResizableProps(nameField, 'Name')?.onResize?.(resizeEvent, 'name', 200);
      jest.advanceTimersByTime(COLUMN_WIDTH_PERSIST_DEBOUNCE_MS);
    });

    expect(result.current.resetAllColumnWidths).toBe(reset);
    act(() => {
      reset();
    });
    expect(clear).toHaveBeenCalledTimes(1);
    expect(result.current.getResizableProps(nameField, 'Name')).not.toHaveProperty('width');

    act(() => {
      reset();
    });
    expect(clear).toHaveBeenCalledTimes(1);
    expect(result.current.columnLayoutKey).toBe(1);

    act(() => {
      result.current.getResizableProps(nameField, 'Name')?.onResize?.(resizeEvent, 'name', 240);
      jest.advanceTimersByTime(COLUMN_WIDTH_PERSIST_DEBOUNCE_MS);
    });
    act(() => {
      reset();
    });
    expect(clear).toHaveBeenCalledTimes(2);
    expect(result.current.columnLayoutKey).toBe(2);
  });
});
