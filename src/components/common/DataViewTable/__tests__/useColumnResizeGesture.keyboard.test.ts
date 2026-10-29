import type { KeyboardEvent } from 'react';

import { act, renderHook, screen } from '@testing-library/react';

import { useColumnResizeGesture } from '../useColumnResizeGesture';

const createTable = (direction: 'ltr' | 'rtl', width = 160): HTMLButtonElement => {
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
  name.style.direction = direction;
  jest.spyOn(name, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect);
  jest.spyOn(status, 'getBoundingClientRect').mockReturnValue({ width: 140 } as DOMRect);
  return button;
};

const keyEvent = (
  button: HTMLButtonElement,
  key: string,
  shiftKey = false,
): KeyboardEvent<HTMLButtonElement> =>
  ({
    currentTarget: button,
    key,
    preventDefault: jest.fn(),
    shiftKey,
    stopPropagation: jest.fn(),
  }) as unknown as KeyboardEvent<HTMLButtonElement>;

afterEach(() => {
  document.body.innerHTML = '';
  jest.restoreAllMocks();
});

describe('column resize keyboard gesture', () => {
  it.each([
    { direction: 'ltr', expected: 165, key: 'ArrowRight', shift: false },
    { direction: 'ltr', expected: 135, key: 'ArrowLeft', shift: true },
    { direction: 'rtl', expected: 155, key: 'ArrowRight', shift: false },
    { direction: 'rtl', expected: 185, key: 'ArrowLeft', shift: true },
  ] as const)(
    '$direction $key with shift=$shift saves width $expected and preserves the neighbor',
    ({ direction, expected, key, shift }) => {
      const button = createTable(direction);
      const commitColumnWidths = jest.fn();
      const flushPendingColumnWidths = jest.fn();
      const { result } = renderHook(() =>
        useColumnResizeGesture({ commitColumnWidths, flushPendingColumnWidths, minWidth: 100 }),
      );

      act(() => {
        result.current.onKeyDown(keyEvent(button, key, shift));
      });

      expect(commitColumnWidths).toHaveBeenCalledWith({ name: expected, status: 140 });
      expect(flushPendingColumnWidths).toHaveBeenCalledTimes(1);
      expect(result.current.announcedWidth).toBe(expected);
    },
  );

  it('uses the same gesture minimum and does not save a no-op at that minimum', () => {
    const button = createTable('ltr', 150);
    const commitColumnWidths = jest.fn();
    const flushPendingColumnWidths = jest.fn();
    const { result } = renderHook(() =>
      useColumnResizeGesture({ commitColumnWidths, flushPendingColumnWidths, minWidth: 150 }),
    );

    act(() => {
      result.current.onKeyDown(keyEvent(button, 'ArrowLeft', true));
    });

    expect(commitColumnWidths).not.toHaveBeenCalled();
    expect(flushPendingColumnWidths).not.toHaveBeenCalled();
    expect(screen.getByRole('table').getAttribute('data-column-widths-customized')).toBe('false');
  });

  it('keeps a legacy narrow width stable on shrink and grows it in normal increments', () => {
    const button = createTable('ltr', 60);
    const commitColumnWidths = jest.fn();
    const { result } = renderHook(() =>
      useColumnResizeGesture({
        commitColumnWidths,
        flushPendingColumnWidths: jest.fn(),
        minWidth: 100,
      }),
    );

    act(() => {
      result.current.onKeyDown(keyEvent(button, 'ArrowLeft'));
      result.current.onKeyDown(keyEvent(button, 'ArrowRight'));
    });

    expect(commitColumnWidths).toHaveBeenCalledTimes(1);
    expect(commitColumnWidths).toHaveBeenCalledWith({ name: 65, status: 140 });
  });
});
