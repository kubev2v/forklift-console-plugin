import type { ReactNode } from 'react';

import { FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS } from '@components/common/DataViewTable/forkliftDataViewTableClass';
import type { ResourceField } from '@components/common/utils/types';
import { TableEmptyCell } from '@components/TableCell/TableEmptyCell';
import { fireEvent, render, screen } from '@testing-library/react';

import ResizableTd from '../ResizableTd';
import { TableColumnWidthProvider } from '../TableColumnWidthContext';

const renderCell = (
  enabled: boolean,
  isAction = false,
  children: ReactNode = 'Cell content',
): void => {
  const field: ResourceField = { isAction, label: 'Name', resourceFieldId: 'name' };
  render(
    <TableColumnWidthProvider enabled={enabled} fields={[field]}>
      <table>
        <tbody>
          <tr>
            <ResizableTd columnId="name" resourceFields={[field]}>
              {children}
            </ResizableTd>
          </tr>
        </tbody>
      </table>
    </TableColumnWidthProvider>,
  );
};

describe('ResizableTd', () => {
  it('allows resizable data cells to shrink without adding a tab stop when text fits', () => {
    renderCell(true);

    expect(screen.getByRole('cell')).toHaveClass('forklift-resizable-cell');
    expect(screen.getByRole('cell')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('cell')).not.toHaveClass('pf-m-nowrap');
    const spacer = screen.getByRole('presentation', { hidden: true });
    expect(spacer).toHaveAttribute('data-column-width-spacer', 'true');
    expect(spacer).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('cell')).toAppearBefore(spacer);
  });

  it('preserves the existing layout when resizing is disabled', () => {
    renderCell(false);

    expect(screen.getByRole('cell')).toHaveClass('pf-m-nowrap');
    expect(screen.getByRole('cell')).not.toHaveClass('pf-m-truncate');
    expect(screen.queryByRole('presentation', { hidden: true })).not.toBeInTheDocument();
  });

  it('renders empty content inside one data cell', () => {
    const fields: ResourceField[] = [
      { label: 'Name', resourceFieldId: 'name' },
      { label: 'Status', resourceFieldId: 'status' },
    ];
    render(
      <TableColumnWidthProvider enabled fields={fields}>
        <table>
          <tbody>
            <tr>
              <ResizableTd columnId="name" resourceFields={fields}>
                <TableEmptyCell />
              </ResizableTd>
            </tr>
          </tbody>
        </table>
      </TableColumnWidthProvider>,
    );

    expect(screen.getAllByRole('cell')).toHaveLength(1);
    expect(screen.getByRole('cell')).toHaveTextContent('-');
  });

  it('keeps sticky action controls outside truncation', () => {
    renderCell(true, true);

    expect(screen.getByRole('cell')).toHaveClass(
      'pf-v6-c-table__sticky-cell',
      FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS,
    );
    expect(screen.getByRole('cell')).toAppearAfter(
      screen.getByRole('presentation', { hidden: true }),
    );
    expect(screen.getByRole('cell')).not.toHaveClass('pf-m-truncate');
    expect(screen.getByRole('cell')).not.toHaveClass('forklift-resizable-cell');
    expect(screen.getByRole('cell')).toHaveAttribute('tabindex', '-1');
  });

  it('reveals clipped React content and makes only a noninteractive cell focusable', async () => {
    renderCell(true, false, <span>Long virtual machine name</span>);
    const cell = screen.getByRole('cell');
    cell.style.overflow = 'hidden';
    Object.defineProperty(cell, 'clientWidth', { configurable: true, value: 100 });
    Object.defineProperty(cell, 'scrollWidth', { configurable: true, value: 300 });

    fireEvent.mouseEnter(cell);

    expect(cell).toHaveAttribute('tabindex', '0');
    expect(cell).toHaveAttribute('data-clipped', 'true');
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Long virtual machine name');
  });

  it('reveals clipped link text on child focus without adding a cell tab stop', async () => {
    renderCell(true, false, <a href="/vm">Long virtual machine name</a>);
    const cell = screen.getByRole('cell');
    cell.style.overflow = 'hidden';
    Object.defineProperty(cell, 'clientWidth', { configurable: true, value: 100 });
    Object.defineProperty(cell, 'scrollWidth', { configurable: true, value: 300 });

    fireEvent.focus(screen.getByRole('link'));

    expect(cell).toHaveAttribute('tabindex', '-1');
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Long virtual machine name');
  });

  it.each([
    {
      child: (
        <button disabled type="button">
          Long virtual machine name
        </button>
      ),
      name: 'disabled button',
    },
    {
      child: (
        <>
          <input type="hidden" />
          <span>Long virtual machine name</span>
        </>
      ),
      name: 'hidden input',
    },
    {
      child: (
        <button tabIndex={-1} type="button">
          Long virtual machine name
        </button>
      ),
      name: 'negative tab index',
    },
  ])('keeps a clipped cell focusable with an unreachable $name', async ({ child }) => {
    renderCell(true, false, child);
    const cell = screen.getByRole('cell');
    cell.style.overflow = 'hidden';
    Object.defineProperty(cell, 'clientWidth', { configurable: true, value: 100 });
    Object.defineProperty(cell, 'scrollWidth', { configurable: true, value: 300 });

    fireEvent.mouseEnter(cell);

    expect(cell).toHaveAttribute('tabindex', '0');
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Long virtual machine name');
  });
});
