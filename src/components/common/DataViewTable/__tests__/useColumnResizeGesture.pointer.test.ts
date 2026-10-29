import type { KeyboardEvent, PointerEvent } from 'react';

import { act, renderHook, screen } from '@testing-library/react';

import { useColumnResizeGesture } from '../useColumnResizeGesture';

const createTable = (width = 160): { button: HTMLButtonElement; name: HTMLTableCellElement } => {
  document.body.innerHTML = `
    <table data-column-widths-customized="false"><thead><tr>
      <th id="name" aria-label="Name" data-resizable-column="true" data-column-width-fixed="false">
        <button type="button" aria-label="Resize Name" data-resize-handle="true"></button>
      </th>
      <th id="status" aria-label="Status" data-resizable-column="true" data-column-width-fixed="false"></th>
    </tr></thead></table>
  `;
  const name = screen.getByRole('columnheader', { name: 'Name' });
  const status = screen.getByRole('columnheader', { name: 'Status' });
  const button = screen.getByRole('button', { name: 'Resize Name' });
  if (
    !(name instanceof HTMLTableCellElement) ||
    !(status instanceof HTMLTableCellElement) ||
    !(button instanceof HTMLButtonElement)
  ) {
    throw new Error('Resizable table fixture is missing');
  }
  jest
    .spyOn(name, 'getBoundingClientRect')
    .mockImplementation(
      () => ({ width: Number.parseFloat(name.style.minWidth) || width }) as DOMRect,
    );
  jest.spyOn(status, 'getBoundingClientRect').mockReturnValue({ width: 140 } as DOMRect);
  return { button, name };
};

const pointerEvent = (
  button: HTMLButtonElement,
  clientX: number,
  pointerType = 'mouse',
): PointerEvent<HTMLButtonElement> =>
  ({
    button: 0,
    clientX,
    currentTarget: button,
    isPrimary: true,
    pointerId: 1,
    pointerType,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  }) as unknown as PointerEvent<HTMLButtonElement>;

afterEach(() => {
  document.body.innerHTML = '';
  jest.restoreAllMocks();
});

describe('column resize pointer gesture', () => {
  it('does not freeze or persist the table after a handle click without movement', () => {
    const { button, name } = createTable();
    const commitColumnWidths = jest.fn();
    const flushPendingColumnWidths = jest.fn();
    const { result } = renderHook(() =>
      useColumnResizeGesture({ commitColumnWidths, flushPendingColumnWidths, minWidth: 100 }),
    );

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80));
      result.current.onPointerUp(pointerEvent(button, 80));
    });

    expect(name.style.minWidth).toBe('');
    expect(name.getAttribute('data-column-width-fixed')).toBe('false');
    expect(screen.getByRole('table').getAttribute('data-column-widths-customized')).toBe('false');
    expect(commitColumnWidths).not.toHaveBeenCalled();
    expect(flushPendingColumnWidths).not.toHaveBeenCalled();
  });

  it('ignores a touch tap with small pointer drift', () => {
    const { button, name } = createTable();
    const commitColumnWidths = jest.fn();
    const { result } = renderHook(() =>
      useColumnResizeGesture({
        commitColumnWidths,
        flushPendingColumnWidths: jest.fn(),
        minWidth: 100,
      }),
    );

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80, 'touch'));
      result.current.onPointerMove(pointerEvent(button, 82, 'touch'));
      result.current.onPointerUp(pointerEvent(button, 82, 'touch'));
    });

    expect(name.style.minWidth).toBe('');
    expect(commitColumnWidths).not.toHaveBeenCalled();
  });

  it.each(['mouse', 'touch'])('commits all measured widths after a %s drag', (pointerType) => {
    const { button, name } = createTable();
    const commitColumnWidths = jest.fn();
    const flushPendingColumnWidths = jest.fn();
    const { result } = renderHook(() =>
      useColumnResizeGesture({ commitColumnWidths, flushPendingColumnWidths, minWidth: 100 }),
    );

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80, pointerType));
      result.current.onPointerMove(pointerEvent(button, 107.5, pointerType));
      result.current.onPointerUp(pointerEvent(button, 107.5, pointerType));
    });

    expect(name.style.minWidth).toBe('187.5px');
    expect(commitColumnWidths).toHaveBeenCalledWith({ name: 187.5, status: 140 });
    expect(flushPendingColumnWidths).toHaveBeenCalledTimes(1);
  });

  it.each(['Escape', 'pointercancel', 'unmount'])('rolls back a %s gesture', (ending) => {
    const { button, name } = createTable();
    const commitColumnWidths = jest.fn();
    const flushPendingColumnWidths = jest.fn();
    const view = renderHook(() =>
      useColumnResizeGesture({ commitColumnWidths, flushPendingColumnWidths, minWidth: 100 }),
    );

    act(() => {
      view.result.current.onPointerDown(pointerEvent(button, 80));
      view.result.current.onPointerMove(pointerEvent(button, 110));
      if (ending === 'Escape') {
        view.result.current.onKeyDown({
          currentTarget: button,
          key: 'Escape',
          preventDefault: jest.fn(),
        } as unknown as KeyboardEvent<HTMLButtonElement>);
      } else if (ending === 'pointercancel') {
        view.result.current.onPointerCancel(pointerEvent(button, 110));
      }
    });
    if (ending === 'unmount') view.unmount();

    expect(name.style.minWidth).toBe('');
    expect(screen.getByRole('table').getAttribute('data-column-widths-customized')).toBe('false');
    expect(commitColumnWidths).not.toHaveBeenCalled();
    expect(flushPendingColumnWidths).not.toHaveBeenCalled();
  });

  it('does not enlarge a saved narrow column when the pointer moves left', () => {
    const { button, name } = createTable(60);
    const commitColumnWidths = jest.fn();
    const { result } = renderHook(() =>
      useColumnResizeGesture({
        commitColumnWidths,
        flushPendingColumnWidths: jest.fn(),
        minWidth: 100,
      }),
    );

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80));
      result.current.onPointerMove(pointerEvent(button, 60));
      result.current.onPointerUp(pointerEvent(button, 60));
    });

    expect(name.style.minWidth).toBe('');
    expect(commitColumnWidths).not.toHaveBeenCalled();
  });
});
