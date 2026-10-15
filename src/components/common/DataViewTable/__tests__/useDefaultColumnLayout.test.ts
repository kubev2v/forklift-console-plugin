import { act, renderHook, type RenderHookResult } from '@testing-library/react';

import { useDefaultColumnLayout } from '../useDefaultColumnLayout';

type LayoutArgs = Parameters<typeof useDefaultColumnLayout>[0];
type LayoutFixture = RenderHookResult<ReturnType<typeof useDefaultColumnLayout>, LayoutArgs> & {
  header: HTMLTableCellElement;
  table: HTMLTableElement;
};

const callbacks: ResizeObserverCallback[] = [];
const observe = jest.fn();
const disconnect = jest.fn();
const originalObserver = global.ResizeObserver;

const renderLayout = (hasCustomColumnWidths = false, includeNestedTable = false): LayoutFixture => {
  const container = document.createElement('div');
  const table = document.createElement('table');
  table.dataset.columnWidthsCustomized = String(hasCustomColumnWidths);
  const header = document.createElement('th');
  header.setAttribute('data-resizable-column', 'true');
  jest.spyOn(header, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect);
  table.createTHead().insertRow().append(header);
  if (includeNestedTable) {
    table.createTBody().insertRow().insertCell().innerHTML =
      '<table><thead><tr><th data-resizable-column="true" style="min-width:999px"></th></tr></thead></table>';
  }
  container.append(table);
  document.body.append(container);
  const view = renderHook((args: LayoutArgs) => useDefaultColumnLayout(args), {
    initialProps: { hasCustomColumnWidths, layoutKey: 'initial' },
  });
  Object.assign(view.result.current.layoutRef, { current: container });
  view.rerender({ hasCustomColumnWidths, layoutKey: 'attached' });
  return { ...view, header, table };
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

  it('does not observe or repeatedly refresh tables nested inside expanded rows', () => {
    const { header, result } = renderLayout(false, true);
    header.style.minWidth = '100px';
    jest.spyOn(header, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect);
    deliverResize();

    expect(observe).toHaveBeenCalledTimes(2);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(result.current.defaultLayoutVersion).toBe(0);
  });

  it('does not remount when cached measurements already match the fitted layout', () => {
    const { header, result } = renderLayout();
    header.style.minWidth = '100px';
    jest.spyOn(header, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect);
    deliverResize();

    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(result.current.defaultLayoutVersion).toBe(0);
  });

  it('refreshes stale default measurements once outside the observer cycle', () => {
    const { header, result } = renderLayout();
    header.style.minWidth = '120px';
    deliverResize();
    deliverResize();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(result.current.defaultLayoutVersion).toBe(0);

    deliverFrame();
    expect(result.current.defaultLayoutVersion).toBe(0);
    header.style.minWidth = '100px';
    jest.spyOn(header, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect);
    deliverResize();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('does not remount if measurements match again before the queued refresh', () => {
    const { header, result } = renderLayout();
    header.style.minWidth = '120px';
    deliverResize();
    header.style.minWidth = '100px';
    jest.spyOn(header, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect);
    deliverFrame();

    expect(result.current.defaultLayoutVersion).toBe(0);
  });

  it('does not refresh a queued default layout once a resize gesture starts', () => {
    const { header, result, table } = renderLayout();
    header.style.minWidth = '120px';
    deliverResize();
    table.dataset.columnWidthsCustomized = 'true';
    deliverFrame();

    expect(result.current.defaultLayoutVersion).toBe(0);
    deliverResize();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('stops observing and cancels pending refreshes when custom widths are saved', () => {
    const { header, rerender } = renderLayout();
    header.style.minWidth = '120px';
    deliverResize();
    rerender({ hasCustomColumnWidths: true, layoutKey: 'attached' });

    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(observe).toHaveBeenCalledTimes(2);
  });

  it('leaves initially persisted custom widths alone', () => {
    const { result } = renderLayout(true);

    expect(ResizeObserver).not.toHaveBeenCalled();
    expect(result.current.defaultLayoutVersion).toBe(0);
  });

  it('does not refresh headers that have not been measured yet', () => {
    const { header } = renderLayout();
    header.style.minWidth = '';
    deliverResize();

    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
