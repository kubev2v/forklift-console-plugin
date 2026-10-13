import { FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS } from '@components/common/DataViewTable/forkliftDataViewTableClass';
import type { ResourceField } from '@components/common/utils/types';
import { render, screen } from '@testing-library/react';

import ResizableTd from '../ResizableTd';
import { TableColumnWidthProvider } from '../TableColumnWidthContext';

const renderCell = (enabled: boolean, isAction = false): void => {
  const field: ResourceField = { isAction, label: 'Name', resourceFieldId: 'name' };
  render(
    <TableColumnWidthProvider enabled={enabled} visibleColumns={[field]}>
      <table>
        <tbody>
          <tr>
            <ResizableTd columnId="name" resourceFields={[field]}>
              Cell content
            </ResizableTd>
          </tr>
        </tbody>
      </table>
    </TableColumnWidthProvider>,
  );
};

describe('ResizableTd', () => {
  it('allows hybrid table data cells to shrink by truncating content', () => {
    renderCell(true);

    expect(screen.getByRole('cell')).toHaveClass('pf-m-truncate');
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
  });
});
