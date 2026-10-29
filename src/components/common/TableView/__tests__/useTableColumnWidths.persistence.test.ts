import type { ColumnWidthsSettings } from '@components/common/Page/types';
import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook, type RenderHookResult } from '@testing-library/react';

import { COLUMN_WIDTH_PERSIST_DEBOUNCE_MS } from '../columnWidthConstants';
import { useTableColumnWidths } from '../useTableColumnWidths';

const nameField: ResourceField = { isVisible: true, label: 'Name', resourceFieldId: 'name' };
const fields = [nameField];

type RenderWidthsResult = RenderHookResult<ReturnType<typeof useTableColumnWidths>, unknown> & {
  save: jest.Mock<undefined, [Record<string, number>]>;
};

const renderWidths = (data: Record<string, number> = {}): RenderWidthsResult => {
  const save = jest.fn<undefined, [Record<string, number>]>();
  const view = renderHook(() =>
    useTableColumnWidths({
      columnWidthsSettings: { clear: jest.fn(), data, save },
      enabled: true,
      fields,
    }),
  );
  return { ...view, save };
};

describe('exact column width persistence', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it.each([79.125, 100, 184.125, 624.125, 1200])(
    'loads a finite positive saved width of %spx exactly',
    (width) => {
      const { result } = renderWidths({ name: width });
      expect(result.current.getResizeConfig(nameField, 'Name')).toMatchObject({
        minWidth: 100,
        savedWidth: width,
      });
    },
  );

  it.each([79.125, 624.125, 1200])('saves the exact committed %spx width', (width) => {
    const { result, save } = renderWidths();
    act(() => {
      result.current.commitColumnWidths({ name: width });
      jest.advanceTimersByTime(COLUMN_WIDTH_PERSIST_DEBOUNCE_MS);
    });
    expect(save).toHaveBeenLastCalledWith({ name: width });
    expect(result.current.getResizeConfig(nameField, 'Name')).toHaveProperty('savedWidth', width);
  });

  it.each([0, -10, NaN, Infinity])('ignores invalid %spx reports', (width) => {
    const { result, save } = renderWidths({ name: 624.125 });
    act(() => {
      result.current.commitColumnWidths({ name: width });
      result.current.flushPendingColumnWidths();
    });
    expect(save).not.toHaveBeenCalled();
    expect(result.current.getResizeConfig(nameField, 'Name')).toHaveProperty('savedWidth', 624.125);
  });

  it.each(['mouseup', 'touchend', 'keyup', 'pagehide'])(
    'flushes a pending save on %s',
    (eventType) => {
      const { result, save } = renderWidths();
      act(() => {
        result.current.commitColumnWidths({ name: 624.125 });
      });
      expect(save).not.toHaveBeenCalled();
      act(() => {
        window.dispatchEvent(new Event(eventType));
      });
      expect(save).toHaveBeenCalledWith({ name: 624.125 });
      act(() => {
        jest.runAllTimers();
      });
      expect(save).toHaveBeenCalledTimes(1);
    },
  );

  it('flushes a pending save on unmount', () => {
    const { result, save, unmount } = renderWidths();
    act(() => {
      result.current.commitColumnWidths({ name: 79.125 });
    });
    unmount();
    expect(save).toHaveBeenCalledWith({ name: 79.125 });
  });

  it('saves pending widths to the originating scope when settings switch', () => {
    const saveA = jest.fn();
    const saveB = jest.fn();
    const settingsA: ColumnWidthsSettings = {
      clear: jest.fn(),
      data: {},
      save: saveA,
      scopeId: 'a',
    };
    const settingsB: ColumnWidthsSettings = {
      clear: jest.fn(),
      data: { name: 300 },
      save: saveB,
      scopeId: 'b',
    };
    const { result, rerender } = renderHook(
      ({ settings }: { settings: ColumnWidthsSettings }) =>
        useTableColumnWidths({ columnWidthsSettings: settings, enabled: true, fields }),
      { initialProps: { settings: settingsA } },
    );
    const originalLayoutKey = result.current.columnLayoutKey;
    act(() => {
      result.current.commitColumnWidths({ name: 200 });
    });
    rerender({ settings: settingsB });
    expect(saveA).toHaveBeenCalledWith({ name: 200 });
    expect(saveB).not.toHaveBeenCalled();
    expect(result.current.getResizeConfig(nameField, 'Name')).toHaveProperty('savedWidth', 300);
    expect(result.current.columnLayoutKey).not.toBe(originalLayoutKey);
    act(() => {
      result.current.commitColumnWidths({ name: 350 });
      result.current.flushPendingColumnWidths();
    });
    expect(saveB).toHaveBeenCalledWith({ name: 350 });
    rerender({ settings: settingsA });
    expect(result.current.getResizeConfig(nameField, 'Name')).not.toHaveProperty('savedWidth');
    expect(result.current.columnLayoutKey).not.toBe(originalLayoutKey);
  });
});
