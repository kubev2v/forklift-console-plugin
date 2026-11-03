import type { KeyboardEvent, PointerEvent } from 'react';

import { act, renderHook, screen } from '@testing-library/react';

import { useColumnResizeGesture } from '../useColumnResizeGesture';

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

describe('column resize with CSS zoom', () => {
  afterEach(() => {
    document.body.replaceChildren();
    jest.restoreAllMocks();
  });

  it('uses layout pixels for pointer and keyboard changes without moving neighbors', () => {
    document.body.innerHTML = `
      <table><thead><tr>
        <th id="name" data-resizable-column="true"><button data-resize-handle="true"></button></th>
        <th id="status" data-resizable-column="true"></th>
      </tr></thead></table>
    `;
    const [name, status] = screen.getAllByRole('columnheader');
    const button = screen.getByRole('button');
    if (!name || !status || !(button instanceof HTMLButtonElement)) {
      throw new Error('Resize fixture is missing');
    }
    for (const header of [name, status]) {
      Object.defineProperty(header, 'currentCSSZoom', { configurable: true, value: 1.5 });
    }
    jest
      .spyOn(name, 'getBoundingClientRect')
      .mockImplementation(
        () => ({ width: (Number.parseFloat(name.style.minWidth) || 160) * 1.5 }) as DOMRect,
      );
    jest.spyOn(status, 'getBoundingClientRect').mockReturnValue({ width: 210 } as DOMRect);

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
      result.current.onPointerMove(pointerEvent(button, 110));
      result.current.onPointerUp(pointerEvent(button, 110));
    });
    expect(name.style.minWidth).toBe('180px');
    expect(status.style.minWidth).toBe('140px');
    expect(commitColumnWidths).toHaveBeenLastCalledWith({ name: 180, status: 140 });

    act(() => {
      result.current.onKeyDown({
        currentTarget: button,
        key: 'ArrowRight',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as KeyboardEvent<HTMLButtonElement>);
    });
    expect(name.style.minWidth).toBe('185px');
    expect(status.style.minWidth).toBe('140px');
    expect(commitColumnWidths).toHaveBeenLastCalledWith({ name: 185, status: 140 });
  });
});
