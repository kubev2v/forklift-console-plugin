/* eslint-disable testing-library/no-node-access -- colgroup layout is verified through DOM fixture nodes */
import { act, renderHook, type RenderHookResult } from '@testing-library/react';

import { useDefaultColumnLayout } from '../useDefaultColumnLayout';

type LayoutArgs = Parameters<typeof useDefaultColumnLayout>[0];
type LayoutFixture = RenderHookResult<ReturnType<typeof useDefaultColumnLayout>, LayoutArgs> & {
  container: HTMLDivElement;
  dataHeader: HTMLTableCellElement;
  table: HTMLTableElement;
};

const callbacks: ResizeObserverCallback[] = [];
const observe = jest.fn();
const disconnect = jest.fn();
const originalObserver = global.ResizeObserver;

const renderLayout = (
  hasCustomColumnWidths = false,
  includeNestedTable = false,
  actionWidth?: { current: number },
): LayoutFixture => {
  const container = document.createElement('div');
  const table = document.createElement('table');
  table.dataset.columnWidthsCustomized = String(hasCustomColumnWidths);
  const row = table.createTHead().insertRow();
  const dataHeader = document.createElement('th');
  dataHeader.dataset.resizableColumn = 'true';
  dataHeader.dataset.defaultColumnMinWidth = '100';
  dataHeader.dataset.defaultColumnWeight = '1';
  const actionHeader = document.createElement('th');
  actionHeader.id = 'actions';
  actionHeader.dataset.actionColumn = 'true';
  actionHeader.style.paddingInlineStart = '16px';
  actionHeader.style.paddingInlineEnd = '16px';
  jest.spyOn(actionHeader, 'getBoundingClientRect').mockReturnValue({ width: 60 } as DOMRect);
  row.append(dataHeader, actionHeader);
  if (actionWidth) {
    const actionCell = table.createTBody().insertRow().insertCell();
    actionCell.dataset.columnId = 'actions';
    actionCell.style.paddingInlineStart = '8px';
    actionCell.style.paddingInlineEnd = '8px';
    const button = document.createElement('button');
    jest
      .spyOn(button, 'getBoundingClientRect')
      .mockImplementation(() => ({ width: actionWidth.current }) as DOMRect);
    actionCell.append(button);
  }
  if (includeNestedTable) {
    table.createTBody().insertRow().insertCell().innerHTML =
      '<table><thead><tr><th data-resizable-column="true"></th></tr></thead></table>';
  }
  container.append(table);
  document.body.append(container);
  jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 500 } as DOMRect);
  const view = renderHook((args: LayoutArgs) => useDefaultColumnLayout(args), {
    initialProps: { hasCustomColumnWidths, layoutKey: 'initial' },
  });
  Object.assign(view.result.current.layoutRef, { current: container });
  view.rerender({ hasCustomColumnWidths, layoutKey: 'attached' });
  return { ...view, container, dataHeader, table };
};

const deliverResize = (): void => {
  act(() => {
    callbacks[callbacks.length - 1]([], {} as ResizeObserver);
  });
};

const deliverFrame = (): void => {
  act(() => {
    const mock = jest.mocked(requestAnimationFrame);
    mock.mock.calls[0][0](0);
  });
};

describe('useDefaultColumnLayout', () => {
  beforeEach(() => {
    callbacks.splice(0);
    observe.mockClear();
    disconnect.mockClear();
    global.ResizeObserver = jest.fn((callback: ResizeObserverCallback): Partial<ResizeObserver> => {
      callbacks.push(callback);
      return { disconnect, observe };
    }) as unknown as typeof ResizeObserver;
    jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.ResizeObserver = originalObserver;
    document.body.replaceChildren();
  });

  it('observes only its own headers and the container', () => {
    const { result } = renderLayout(false, true);
    expect(observe).toHaveBeenCalledTimes(3);
    expect(result.current.defaultLayoutVersion).toBe(0);
  });

  it('refreshes widths after the container changes without remounting', () => {
    const { container, result, table } = renderLayout();
    expect(
      table.querySelector('col')?.style.getPropertyValue('--forklift-default-column-width'),
    ).toBe('468px');
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 700 } as DOMRect);
    deliverResize();
    deliverResize();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    deliverFrame();
    expect(
      table.querySelector('col')?.style.getPropertyValue('--forklift-default-column-width'),
    ).toBe('668px');
    expect(result.current.defaultLayoutVersion).toBe(0);
  });

  it('remeasures a late-styled Actions button even while its header box stays fixed', () => {
    const actionWidth = { current: 40 };
    const { table } = renderLayout(false, false, actionWidth);
    const button = table.querySelector('tbody button');
    expect(observe).toHaveBeenCalledWith(button);
    expect(
      table.querySelector('col')?.style.getPropertyValue('--forklift-default-column-width'),
    ).toBe('444px');

    actionWidth.current = 80;
    deliverResize();
    deliverFrame();
    expect(
      table.querySelector('col')?.style.getPropertyValue('--forklift-default-column-width'),
    ).toBe('404px');
  });

  it('defers no refresh while a resize gesture is active', () => {
    const { container, table } = renderLayout(true);
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 700 } as DOMRect);
    table.dataset.columnResizeActive = 'true';
    deliverResize();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    delete table.dataset.columnResizeActive;
    deliverResize();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('keeps partial customized layouts under observation', () => {
    const { table } = renderLayout(true);
    expect(table.querySelector('colgroup[data-default-column-widths]')).not.toBeNull();
    expect(observe).toHaveBeenCalledTimes(3);
  });

  it('cancels queued refreshes and removes the group on unmount', () => {
    const { container, table, unmount } = renderLayout();
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 700 } as DOMRect);
    deliverResize();
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(table.querySelector('colgroup')).toBeNull();
  });
});
