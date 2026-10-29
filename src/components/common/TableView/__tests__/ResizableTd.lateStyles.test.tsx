import { act, fireEvent, render, screen } from '@testing-library/react';

import type { ResourceField } from '../../utils/types';
import ResizableTd from '../ResizableTd';
import { TableColumnWidthProvider } from '../TableColumnWidthContext';

const renderDisclosureCell = (): ReturnType<typeof render> => {
  const fields: ResourceField[] = [
    { label: 'Name', resourceFieldId: 'name' },
    { label: 'Status', resourceFieldId: 'status' },
  ];
  return render(
    <TableColumnWidthProvider enabled fields={fields}>
      <table>
        <tbody>
          <tr>
            <ResizableTd columnId="name" resourceFields={fields}>
              <span>Long cell text</span>
            </ResizableTd>
          </tr>
        </tbody>
      </table>
    </TableColumnWidthProvider>,
  );
};

const setCellTextWidth = (cell: HTMLElement, scrollWidth: number): void => {
  cell.style.overflow = 'hidden';
  Object.defineProperty(cell, 'clientWidth', { configurable: true, value: 100 });
  Object.defineProperty(cell, 'scrollWidth', { configurable: true, value: scrollWidth });
};

describe('ResizableTd late text clipping', () => {
  it('updates keyboard reachability after font load without a cell resize', () => {
    const originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts');
    const fonts = new EventTarget();
    const removeEventListener = jest.spyOn(fonts, 'removeEventListener');
    Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });

    try {
      const { unmount } = renderDisclosureCell();
      const cell = screen.getByRole('cell');
      setCellTextWidth(cell, 100);
      expect(cell).toHaveAttribute('tabindex', '-1');

      setCellTextWidth(cell, 300);
      expect(cell).toHaveAttribute('tabindex', '-1');
      act(() => {
        fonts.dispatchEvent(new Event('loadingdone'));
      });
      expect(cell).toHaveAttribute('tabindex', '0');

      unmount();
      expect(removeEventListener).toHaveBeenCalledWith('loadingdone', expect.any(Function));
    } finally {
      if (originalFonts) {
        Object.defineProperty(document, 'fonts', originalFonts);
      } else {
        Reflect.deleteProperty(document, 'fonts');
      }
    }
  });

  it('updates clipping after a stylesheet load without a cell resize', () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    document.head.append(link);
    const { unmount } = renderDisclosureCell();
    const cell = screen.getByRole('cell');
    setCellTextWidth(cell, 100);
    expect(cell).toHaveAttribute('tabindex', '-1');

    setCellTextWidth(cell, 300);
    expect(cell).toHaveAttribute('tabindex', '-1');
    fireEvent.load(link);
    expect(cell).toHaveAttribute('tabindex', '0');

    unmount();
    link.remove();
  });

  it('hides a revealed tooltip when later styles make the cell text fit', async () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    document.head.append(link);
    const { unmount } = renderDisclosureCell();
    const cell = screen.getByRole('cell');
    setCellTextWidth(cell, 300);
    fireEvent.mouseEnter(cell);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Long cell text');

    setCellTextWidth(cell, 100);
    fireEvent.load(link);

    expect(cell).toHaveAttribute('tabindex', '-1');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    unmount();
    link.remove();
  });
});
