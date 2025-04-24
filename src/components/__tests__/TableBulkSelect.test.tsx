import TableBulkSelect from '@components/TableBulkSelect';
import { describe, expect, test } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
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

    const mainCheckbox = screen.getByRole('checkbox', { name: 'Select page' });

    await waitFor(async () => {
      await user.click(mainCheckbox);
      expect(onSelectMock).toHaveBeenCalledWith(['id1', 'id2', 'id3']);
    });
  });

  test('de-select all IDs on the current page with main checkbox', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TableBulkSelect {...defaultProps} selectedIds={[]} />);
    const mainCheckbox = screen.getByRole('checkbox', { name: 'Select page' });

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
    const mainCheckbox = screen.getByRole('checkbox', { name: 'Select page' });
    const dropdown = screen.getByRole('button', { name: 'Bulk select toggle' });

    await waitFor(async () => {
      await user.click(dropdown);
      await user.click(screen.getByText(/Select all/u));

      expect(onSelectMock).toHaveBeenCalledWith(['id1', 'id2', 'id3', 'id4']);
    });

    rerender(<TableBulkSelect {...defaultProps} selectedIds={['id1', 'id2', 'id3', 'id4']} />);

    await waitFor(async () => {
      await user.click(mainCheckbox);
      expect(onSelectMock).toHaveBeenCalledWith([]);
    });
  });

  test('select IDs across all pages using dropdown option', async () => {
    const user = userEvent.setup();
    render(<TableBulkSelect {...defaultProps} selectedIds={[]} />);

    const dropdown = screen.getByRole('button', { name: 'Bulk select toggle' });

    await waitFor(async () => {
      await user.click(dropdown);
      await user.click(screen.getByText(/Select all/u));

      expect(onSelectMock).toHaveBeenCalledWith(['id1', 'id2', 'id3', 'id4']);
    });
  });

  test('select IDs on current page using dropdown option', async () => {
    const user = userEvent.setup();
    render(<TableBulkSelect {...defaultProps} selectedIds={[]} />);

    const dropdown = screen.getByRole('button', { name: 'Bulk select toggle' });

    await waitFor(async () => {
      await user.click(dropdown);
      await user.click(screen.getByText(/Select page/u));

      expect(onSelectMock).toHaveBeenCalledWith(['id1', 'id2', 'id3']);
    });
  });

  test('de-select all IDs using dropdown option', async () => {
    const user = userEvent.setup();
    render(<TableBulkSelect {...defaultProps} selectedIds={[]} />);

    const dropdown = screen.getByRole('button', { name: 'Bulk select toggle' });

    await waitFor(async () => {
      await user.click(dropdown);
      await user.click(screen.getByText(/Select none/u));

      expect(onSelectMock).toHaveBeenCalledWith([]);
    });
  });
});
