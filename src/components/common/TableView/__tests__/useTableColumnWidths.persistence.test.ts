import type { MouseEvent } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook, type RenderHookResult } from '@testing-library/react';

import { COLUMN_WIDTH_PERSIST_DEBOUNCE_MS } from '../columnWidthConstants';
import { useTableColumnWidths } from '../useTableColumnWidths';

const nameField: ResourceField = { label: 'Name', resourceFieldId: 'name' };
const resizeEvent = {} as MouseEvent;

type RenderWidthsResult = RenderHookResult<ReturnType<typeof useTableColumnWidths>, unknown> & {
  save: jest.Mock<undefined, [Record<string, number>]>;
};

const renderWidths = (data: Record<string, number> = {}): RenderWidthsResult => {
  const save = jest.fn<undefined, [Record<string, number>]>();
  const view = renderHook(() =>
    useTableColumnWidths({
      columnWidthsSettings: { clear: jest.fn(), data, save },
      enabled: true,
    }),
  );
  return { ...view, save };
};

describe('exact column width persistence', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([79.125, 100, 184.125, 624.125, 1200])(
    'loads %spx without imposing storage bounds',
    (width) => {
      const { result } = renderWidths({ name: width });

      expect(result.current.getResizableProps(nameField, 'Name')).toMatchObject({
        minWidth: 100,
        width,
      });
    },
  );

  it.each([79.125, 624.125, 1200])('saves the exact %spx reported by PatternFly', (width) => {
    const { result, save } = renderWidths();

    act(() => {
      result.current.getResizableProps(nameField, 'Name')?.onResize?.(resizeEvent, 'name', width);
      jest.advanceTimersByTime(COLUMN_WIDTH_PERSIST_DEBOUNCE_MS);
    });

    expect(save).toHaveBeenLastCalledWith({ name: width });
    expect(result.current.getResizableProps(nameField, 'Name')).toMatchObject({ width });
    expect(result.current.columnLayoutKey).toBe(0);
  });

  it.each([0, -10, NaN, Infinity])(
    'ignores an invalid %spx resize instead of inventing a width',
    (width) => {
      const { result, save } = renderWidths({ name: 624.125 });

      act(() => {
        result.current.getResizableProps(nameField, 'Name')?.onResize?.(resizeEvent, 'name', width);
      });

      expect(save).not.toHaveBeenCalled();
      expect(result.current.getResizableProps(nameField, 'Name')).toMatchObject({ width: 624.125 });
    },
  );

  it('ignores invalid saved widths instead of marking the table customized', () => {
    const { result } = renderWidths({ name: -1 });

    expect(result.current.getResizableProps(nameField, 'Name')).not.toHaveProperty('width');
    expect(result.current.hasCustomColumnWidths).toBe(false);
  });
});
