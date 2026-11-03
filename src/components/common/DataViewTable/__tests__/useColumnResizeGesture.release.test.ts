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

const windowPointerEvent = (
  type: string,
  clientX: number,
  pointerId = 1,
): globalThis.PointerEvent => {
  const event = new Event(type) as unknown as globalThis.PointerEvent;
  Object.defineProperties(event, {
    clientX: { value: clientX },
    pointerId: { value: pointerId },
  });
  return event;
};

const renderGesture = (): {
  button: HTMLButtonElement;
  commitColumnWidths: jest.Mock;
  result: { current: ReturnType<typeof useColumnResizeGesture> };
  unmount: () => void;
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
  const { result, unmount } = renderHook(() =>
    useColumnResizeGesture({
      commitColumnWidths,
      flushPendingColumnWidths: jest.fn(),
      minWidth: 100,
    }),
  );
  return { button, commitColumnWidths, result, unmount };
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

  it('ignores a window release from a different pointer', () => {
    const { button, commitColumnWidths, result } = renderGesture();

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80));
      result.current.onPointerMove(pointerEvent(button, 100));
    });
    act(() => {
      window.dispatchEvent(windowPointerEvent('pointerup', 120, 2));
    });

    expect(commitColumnWidths).not.toHaveBeenCalled();
    expect(screen.getByRole('table').hasAttribute('data-column-resize-active')).toBe(true);
  });

  it('rolls back when the window reports a cancel for the drag pointer', () => {
    const { button, commitColumnWidths, result } = renderGesture();

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80));
      result.current.onPointerMove(pointerEvent(button, 100));
    });
    act(() => {
      window.dispatchEvent(windowPointerEvent('pointercancel', 120));
    });

    expect(commitColumnWidths).not.toHaveBeenCalled();
    expect(screen.getByRole('table').hasAttribute('data-column-resize-active')).toBe(false);
    const [header] = screen.getAllByRole('columnheader');
    expect(header.style.minWidth).toBe('');
  });

  it('stops listening on the window after unmount', () => {
    const { button, commitColumnWidths, result, unmount } = renderGesture();

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80));
      result.current.onPointerMove(pointerEvent(button, 100));
    });
    act(() => {
      unmount();
    });
    act(() => {
      window.dispatchEvent(windowPointerEvent('pointerup', 120));
    });

    expect(commitColumnWidths).not.toHaveBeenCalled();
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
