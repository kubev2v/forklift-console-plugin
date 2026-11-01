import type { PointerEvent } from 'react';

import { act, renderHook, screen } from '@testing-library/react';

import { useColumnResizeGesture } from '../useColumnResizeGesture';

const createTable = (width = 160): HTMLButtonElement => {
  document.body.innerHTML = `
    <table data-column-widths-customized="false"><thead><tr>
      <th id="name" aria-label="Name" data-resizable-column="true" data-column-width-fixed="false">
        <button type="button" aria-label="Resize Name" data-resize-handle="true"></button>
      </th>
      <th id="status" aria-label="Status" data-resizable-column="true"></th>
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
  jest.spyOn(name, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect);
  jest.spyOn(status, 'getBoundingClientRect').mockReturnValue({ width: 140 } as DOMRect);
  return button;
};

const pointerEvent = (
  button: HTMLButtonElement,
  clientX: number,
): PointerEvent<HTMLButtonElement> =>
  ({
    button: 0,
    clientX,
    currentTarget: button,
    isPrimary: true,
    pointerId: 1,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  }) as unknown as PointerEvent<HTMLButtonElement>;

afterEach(() => {
  document.body.innerHTML = '';
  jest.restoreAllMocks();
});

describe('column resize pointer capture', () => {
  it('releases pointer capture when the gesture ends or is cancelled', () => {
    const button = createTable();
    const hasPointerCapture = jest.fn(() => true);
    const releasePointerCapture = jest.fn();
    const setPointerCapture = jest.fn();
    Object.assign(button, { hasPointerCapture, releasePointerCapture, setPointerCapture });
    const { result } = renderHook(() =>
      useColumnResizeGesture({
        commitColumnWidths: jest.fn(),
        flushPendingColumnWidths: jest.fn(),
        minWidth: 100,
      }),
    );

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80));
      result.current.onPointerMove(pointerEvent(button, 110));
      result.current.onPointerUp(pointerEvent(button, 110));
    });

    expect(setPointerCapture).toHaveBeenCalledWith(1);
    expect(hasPointerCapture).toHaveBeenCalledWith(1);
    expect(releasePointerCapture).toHaveBeenCalledWith(1);

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80));
      result.current.onPointerMove(pointerEvent(button, 110));
      result.current.onPointerCancel(pointerEvent(button, 110));
    });

    expect(releasePointerCapture).toHaveBeenCalledTimes(2);
  });
});
