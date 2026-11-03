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

describe('final pointer position', () => {
  afterEach(() => {
    document.body.replaceChildren();
    jest.restoreAllMocks();
  });

  it('commits a drag when pointerup is the first movement event', () => {
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

    act(() => {
      result.current.onPointerDown(pointerEvent(button, 80));
      result.current.onPointerUp(pointerEvent(button, 100));
    });

    expect(commitColumnWidths).toHaveBeenCalledWith({ name: 180, status: 140 });
  });
});
