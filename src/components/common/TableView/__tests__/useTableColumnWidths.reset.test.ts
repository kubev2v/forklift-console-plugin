import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook, type RenderHookResult } from '@testing-library/react';

import { useTableColumnWidths } from '../useTableColumnWidths';

const nameField: ResourceField = { isVisible: true, label: 'Name', resourceFieldId: 'name' };
const hiddenField: ResourceField = { isVisible: false, label: 'Status', resourceFieldId: 'status' };
const fields = [nameField, hiddenField];

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
      fields,
    }),
  );
  return { ...view, clear, save };
};

describe('column width reset', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('does nothing when no known width was saved', () => {
    const { clear, result } = renderWidths({ stale: 140 });
    const initialLayoutKey = result.current.columnLayoutKey;
    expect(result.current.hasKnownColumnWidths).toBe(false);
    act(() => {
      result.current.resetAllColumnWidths();
    });
    expect(clear).not.toHaveBeenCalled();
    expect(result.current.columnLayoutKey).toBe(initialLayoutKey);
  });

  it('resets hidden known widths and keeps repeated calls idempotent', () => {
    const { clear, result } = renderWidths({ status: 79.125 });
    const initialLayoutKey = result.current.columnLayoutKey;
    expect(result.current.hasCustomColumnWidths).toBe(false);
    expect(result.current.hasKnownColumnWidths).toBe(true);
    act(() => {
      result.current.resetAllColumnWidths();
      result.current.resetAllColumnWidths();
    });
    expect(clear).toHaveBeenCalledTimes(1);
    expect(result.current.hasKnownColumnWidths).toBe(false);
    expect(result.current.columnLayoutKey).not.toBe(initialLayoutKey);
  });

  it('cancels the pending save before clearing settings', () => {
    const { clear, result, save, unmount } = renderWidths({ name: 100 });
    act(() => {
      result.current.commitColumnWidths({ name: 240 });
      result.current.resetAllColumnWidths();
      window.dispatchEvent(new Event('pagehide'));
    });
    unmount();
    jest.runAllTimers();
    expect(save).not.toHaveBeenCalled();
    expect(clear).toHaveBeenCalledTimes(1);
    expect(result.current.getResizeConfig(nameField, 'Name')).not.toHaveProperty('savedWidth');
  });

  it('preserves widths when clearing storage fails', () => {
    const clear = jest.fn((): void => {
      throw new Error('storage failed');
    });
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings: { clear, data: { name: 100 }, save: jest.fn() },
        enabled: true,
        fields,
      }),
    );
    const initialLayoutKey = result.current.columnLayoutKey;
    expect(() => {
      act(() => {
        result.current.resetAllColumnWidths();
      });
    }).toThrow('storage failed');
    expect(result.current.getResizeConfig(nameField, 'Name')).toHaveProperty('savedWidth', 100);
    expect(result.current.columnLayoutKey).toBe(initialLayoutKey);
  });

  it('retained Reset callbacks operate on the latest committed widths', () => {
    const { clear, result } = renderWidths();
    const reset = result.current.resetAllColumnWidths;
    const initialLayoutKey = result.current.columnLayoutKey;
    act(() => {
      result.current.commitColumnWidths({ name: 180 });
      result.current.flushPendingColumnWidths();
    });
    act(() => {
      reset();
    });
    expect(clear).toHaveBeenCalledTimes(1);
    expect(result.current.columnLayoutKey).not.toBe(initialLayoutKey);
    act(() => {
      reset();
    });
    expect(clear).toHaveBeenCalledTimes(1);
  });
});
