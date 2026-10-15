import type { MouseEvent } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook, type RenderHookResult } from '@testing-library/react';

import { useTableColumnWidths } from '../useTableColumnWidths';

const nameField: ResourceField = { label: 'Name', resourceFieldId: 'name' };
const projectField: ResourceField = { label: 'Project', resourceFieldId: 'namespace' };
const resizeEvent = {} as MouseEvent;
const snapshot = { name: 160.25, namespace: 110.125, vms: 60.75 };

type WidthsResult = RenderHookResult<ReturnType<typeof useTableColumnWidths>, unknown> & {
  save: jest.Mock<undefined, [Record<string, number>]>;
};

const renderWidths = (data: Record<string, number> = {}): WidthsResult => {
  const save = jest.fn<undefined, [Record<string, number>]>();
  const view = renderHook(() =>
    useTableColumnWidths({
      columnWidthsSettings: { clear: jest.fn(), data, save },
      enabled: true,
    }),
  );
  return { ...view, save };
};

describe('complete resized layout persistence', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('does not turn initial preferences or a staged snapshot into saved user overrides', () => {
    const { result, save } = renderWidths();
    act(() => {
      result.current.captureColumnWidths(snapshot);
      jest.runAllTimers();
    });
    expect(save).not.toHaveBeenCalled();
    expect(result.current.hasCustomColumnWidths).toBe(false);
    expect(result.current.getResizableProps(projectField, 'Project')).not.toHaveProperty('width');
  });

  it('saves untouched rendered widths together with the exact reported resize', () => {
    const { result, save } = renderWidths();
    act(() => {
      result.current.captureColumnWidths(snapshot);
      result.current.getResizableProps(nameField, 'Name')?.onResize?.(resizeEvent, 'name', 624.125);
      window.dispatchEvent(new Event('mouseup'));
    });
    expect(save).toHaveBeenLastCalledWith({ ...snapshot, name: 624.125 });
    expect(result.current.getResizableProps(projectField, 'Project')).toMatchObject({
      width: 110.125,
    });
    expect(result.current.columnLayoutKey).toBe(0);
  });

  it('preserves existing and hidden overrides while capturing newly visible columns', () => {
    const { result, save } = renderWidths({ hidden: 79.125, name: 624.125 });
    act(() => {
      result.current.captureColumnWidths(snapshot);
      result.current
        .getResizableProps(projectField, 'Project')
        ?.onResize?.(resizeEvent, 'namespace', 145.5);
      window.dispatchEvent(new Event('keyup'));
    });
    expect(save).toHaveBeenLastCalledWith({
      hidden: 79.125,
      name: 624.125,
      namespace: 145.5,
      vms: 60.75,
    });
  });

  it('sanitizes snapshots and ignores invalid resize reports without persisting a snapshot', () => {
    const { result, save } = renderWidths();
    act(() => {
      result.current.captureColumnWidths({ ...snapshot, invalid: NaN, zero: 0 });
      result.current.getResizableProps(nameField, 'Name')?.onResize?.(resizeEvent, 'name', NaN);
      window.dispatchEvent(new Event('mouseup'));
    });
    expect(save).not.toHaveBeenCalled();
    act(() => {
      result.current.getResizableProps(nameField, 'Name')?.onResize?.(resizeEvent, 'name', 79.125);
      window.dispatchEvent(new Event('mouseup'));
    });
    expect(save).toHaveBeenLastCalledWith({ ...snapshot, name: 79.125 });
  });

  it.each([false, true])(
    'clears staged snapshots on Reset when overrides exist: %s',
    (hasOverrides) => {
      const { result, save } = renderWidths(hasOverrides ? { name: 624.125 } : {});
      act(() => {
        result.current.captureColumnWidths(snapshot);
        result.current.resetAllColumnWidths();
        result.current.getResizableProps(nameField, 'Name')?.onResize?.(resizeEvent, 'name', 200);
        window.dispatchEvent(new Event('mouseup'));
      });
      expect(save).toHaveBeenLastCalledWith({ name: 200 });
    },
  );
});
