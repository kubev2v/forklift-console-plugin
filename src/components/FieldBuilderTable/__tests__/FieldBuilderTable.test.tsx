import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import FieldBuilderTable from '../FieldBuilderTable';

const renderTable = (
  props: Partial<Parameters<typeof FieldBuilderTable>[0]> = {},
): ReturnType<typeof render> =>
  render(
    <FieldBuilderTable
      addButton={{ label: 'Add item', onClick: jest.fn() }}
      fieldRows={[]}
      headers={[{ label: 'Value' }]}
      removeButton={{ onClick: jest.fn() }}
      {...props}
    />,
  );

describe('FieldBuilderTable', () => {
  describe('additionalActions', () => {
    it('renders only the add button when additionalActions is not provided', () => {
      renderTable();

      expect(screen.getByTestId('add-mapping-button')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('renders additionalActions next to the add button when additionalActions is provided', () => {
      renderTable({
        additionalActions: (
          <button data-testid="extra-action" type="button">
            Extra
          </button>
        ),
      });

      expect(screen.getByTestId('add-mapping-button')).toBeInTheDocument();
      expect(screen.getByTestId('extra-action')).toBeInTheDocument();
    });

    it('keeps the add button working when additionalActions is provided', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();

      renderTable({
        addButton: { label: 'Add item', onClick: onAdd },
        additionalActions: <button type="button">Extra</button>,
      });

      await user.click(screen.getByTestId('add-mapping-button'));

      expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it('keeps the add button disabled state when additionalActions is provided', () => {
      renderTable({
        addButton: { isDisabled: true, label: 'Add item', onClick: jest.fn() },
        additionalActions: <button type="button">Extra</button>,
      });

      expect(screen.getByTestId('add-mapping-button')).toBeDisabled();
    });
  });
});
