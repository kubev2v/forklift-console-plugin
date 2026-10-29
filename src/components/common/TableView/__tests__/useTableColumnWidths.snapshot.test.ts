import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook, type RenderHookResult } from '@testing-library/react';

import { useTableColumnWidths } from '../useTableColumnWidths';

const fields: ResourceField[] = [
  { isVisible: true, label: 'Name', resourceFieldId: 'name' },
  { isVisible: true, label: 'Project', resourceFieldId: 'namespace' },
  { isVisible: true, label: 'VMs', resourceFieldId: 'vms' },
  { isVisible: false, label: 'Hidden', resourceFieldId: 'hidden' },
];

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

describe('complete resized layout persistence', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('does not persist default preferences before a resize commits', () => {
    const { result, save } = renderWidths();
    act(() => {
      jest.runAllTimers();
    });
    expect(save).not.toHaveBeenCalled();
    expect(result.current.hasCustomColumnWidths).toBe(false);
  });

  it('saves the complete visible snapshot with the exact resized width', () => {
    const { result, save } = renderWidths();
    const initialLayoutKey = result.current.columnLayoutKey;
    const snapshot = { name: 624.125, namespace: 110.125, vms: 96.75 };
    act(() => {
      result.current.commitColumnWidths(snapshot);
      result.current.flushPendingColumnWidths();
    });
    expect(save).toHaveBeenLastCalledWith(snapshot);
    expect(result.current.getResizeConfig(fields[1], 'Project')).toHaveProperty(
      'savedWidth',
      110.125,
    );
    expect(result.current.columnLayoutKey).toBe(initialLayoutKey);
  });

  it('retains hidden saved widths while rejecting hidden and unknown snapshot entries', () => {
    const { result, save } = renderWidths({ hidden: 79.125, name: 624.125 });
    act(() => {
      result.current.commitColumnWidths({
        hidden: 500,
        name: 624.125,
        namespace: 145.5,
        unknown: 700,
        vms: 96.75,
      });
      result.current.flushPendingColumnWidths();
    });
    expect(save).toHaveBeenLastCalledWith({
      hidden: 79.125,
      name: 624.125,
      namespace: 145.5,
      vms: 96.75,
    });
  });

  it('ignores invalid widths and an unchanged snapshot', () => {
    const { result, save } = renderWidths({ name: 180, namespace: 160, vms: 96 });
    act(() => {
      result.current.commitColumnWidths({
        name: 180,
        namespace: 160,
        vms: 96,
        zero: 0,
        invalid: NaN,
      });
      result.current.flushPendingColumnWidths();
    });
    expect(save).not.toHaveBeenCalled();
  });

  it('rejects an incomplete or invalid visible snapshot instead of saving a partial layout', () => {
    const { result, save } = renderWidths({ name: 180, namespace: 160, vms: 96 });
    act(() => {
      result.current.commitColumnWidths({ name: 300, namespace: 160 });
      result.current.commitColumnWidths({ name: 300, namespace: 0, vms: 96 });
      result.current.flushPendingColumnWidths();
    });
    expect(save).not.toHaveBeenCalled();
    expect(result.current.getResizeConfig(fields[0], 'Name')).toHaveProperty('savedWidth', 180);
  });
});
