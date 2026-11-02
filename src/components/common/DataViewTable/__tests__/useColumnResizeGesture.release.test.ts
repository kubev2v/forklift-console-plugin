import type { PointerEvent } from 'react';

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

const windowPointerEvent = (type: string, clientX: number): globalThis.PointerEvent => {
  const event = new Event(type) as unknown as globalThis.PointerEvent;
  Object.defineProperties(event, {
    clientX: { value: clientX },
    pointerId: { value: 1 },
  });
  return event;
};

const renderGesture = (): {
  button: HTMLButtonElement;
  commitColumnWidths: jest.Mock;
  result: { current: ReturnType<typeof useColumnResizeGesture> };
} => {
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
  jest.spyOn(name, 'getBoundingClientRect').mockReturnValue({ width: 160 } as DOMRect);
  jest.spyOn(status, 'getBoundingClientRect').mockReturnValue({ width: 140 } as DOMRect);
  const commitColumnWidths = jest.fn();
  const { result } = renderHook(() =>
    useColumnResizeGesture({
      commitColumnWidths,
      flushPendingColumnWidths: jest.fn(),
      minWidth: 100,
    }),
  );
  return { button, commitColumnWidths, result };
};

describe('column resize release outside the handle', () => {
  afterEach(() => {
    document.body.replaceChildren();
    jest.restoreAllMocks();
  });

  it('commits the dragged width when the pointer is released off the handle', () => {
    const { button, commitColumnWidths, result } = renderGesture();

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80));
      result.current.onPointerMove(pointerEvent(button, 100));
    });
    // The pointer is released outside the 32px target, so only the window sees it.
    act(() => {
      window.dispatchEvent(windowPointerEvent('pointerup', 120));
    });

    expect(commitColumnWidths).toHaveBeenCalledWith({ name: 200, status: 140 });
  });

  it('keeps the dragged width when pointer capture is lost mid-drag', () => {
    const { button, commitColumnWidths, result } = renderGesture();

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80));
      result.current.onPointerMove(pointerEvent(button, 100));
    });
    act(() => {
      result.current.onLostPointerCapture({} as PointerEvent<HTMLButtonElement>);
    });

    expect(commitColumnWidths).toHaveBeenCalledWith({ name: 180, status: 140 });
  });
});
