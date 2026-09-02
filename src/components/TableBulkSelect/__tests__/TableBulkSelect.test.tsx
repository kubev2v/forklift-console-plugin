import TableBulkSelect from '@components/TableBulkSelect/TableBulkSelect';
import { describe, expect, test } from '@jest/globals';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

describe('TableBulkSelect', () => {
  const onSelectMock = jest.fn();
  const defaultProps = {
    dataIds: ['id1', 'id2', 'id3', 'id4'],
    onSelect: onSelectMock,
    pageDataIds: ['id1', 'id2', 'id3'],
    selectedIds: ['id1'],
  };

  test('select all IDs on the current page with main checkbox', async () => {
    const user = userEvent.setup();
    render(<TableBulkSelect {...defaultProps} />);

    const mainCheckbox = screen.getByTestId('table-bulk-select-checkbox');

    await waitFor(async () => {
      await user.click(mainCheckbox);
      expect(onSelectMock).toHaveBeenCalledWith(['id1', 'id2', 'id3']);
    });
  });

  test('de-select all IDs on the current page with main checkbox', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TableBulkSelect {...defaultProps} selectedIds={[]} />);
    const mainCheckbox = screen.getByTestId('table-bulk-select-checkbox');

    await waitFor(async () => {
      await user.click(mainCheckbox);
      expect(onSelectMock).toHaveBeenCalledWith(['id1', 'id2', 'id3']);
    });

    rerender(<TableBulkSelect {...defaultProps} selectedIds={['id1', 'id2', 'id3']} />);

    await waitFor(async () => {
      await user.click(mainCheckbox);
      expect(onSelectMock).toHaveBeenCalledWith([]);
    });
  });

  test('de-select IDs across all pages with main checkbox', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TableBulkSelect {...defaultProps} selectedIds={[]} />);
    const mainCheckbox = screen.getByTestId('table-bulk-select-checkbox');

    fireEvent.click(screen.getByTestId('table-bulk-select-toggle'));
    fireEvent.click(
      within(await screen.findByTestId('table-bulk-select-select-all')).getByRole('menuitem'),
    );

    expect(onSelectMock).toHaveBeenCalledWith(['id1', 'id2', 'id3', 'id4']);

    rerender(<TableBulkSelect {...defaultProps} selectedIds={['id1', 'id2', 'id3', 'id4']} />);

    await waitFor(async () => {
      await user.click(mainCheckbox);
      expect(onSelectMock).toHaveBeenCalledWith([]);
    });
  });

  test('select IDs across all pages using dropdown option', async () => {
    render(<TableBulkSelect {...defaultProps} selectedIds={[]} />);

    fireEvent.click(screen.getByTestId('table-bulk-select-toggle'));
    fireEvent.click(
      within(await screen.findByTestId('table-bulk-select-select-all')).getByRole('menuitem'),
    );

    expect(onSelectMock).toHaveBeenCalledWith(['id1', 'id2', 'id3', 'id4']);
  });

  test('select IDs on current page using dropdown option', async () => {
    render(<TableBulkSelect {...defaultProps} selectedIds={[]} />);

    fireEvent.click(screen.getByTestId('table-bulk-select-toggle'));
    fireEvent.click(
      within(await screen.findByTestId('table-bulk-select-select-page')).getByRole('menuitem'),
    );

    expect(onSelectMock).toHaveBeenCalledWith(['id1', 'id2', 'id3']);
  });

  test('de-select all IDs using dropdown option', async () => {
    render(<TableBulkSelect {...defaultProps} selectedIds={[]} />);

    fireEvent.click(screen.getByTestId('table-bulk-select-toggle'));
    fireEvent.click(
      within(await screen.findByTestId('table-bulk-select-select-none')).getByRole('menuitem'),
    );

    expect(onSelectMock).toHaveBeenCalledWith([]);
  });
});
