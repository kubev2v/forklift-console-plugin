import { beforeEach, describe, expect, test } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import TypeaheadSelect from '../TypeaheadSelect';
import type { TypeaheadSelectOption } from '../utils/types';

import { defaultProps, mockOnChange, mockOnInputChange } from './typeaheadSelect.fixtures';

describe('TypeaheadSelect - filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('filters options as user types', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, '1');

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });
  });

  test('performs case insensitive filtering', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'OPTION 1');

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });
  });

  test('applies custom filter function when provided', async () => {
    const user = userEvent.setup();
    const customFilter = (
      filterValue: string,
      options: TypeaheadSelectOption[],
    ): TypeaheadSelectOption[] =>
      options.filter((option) => String(option.value).includes(filterValue));

    render(<TypeaheadSelect {...defaultProps} filterFunction={customFilter} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, '2');

    await waitFor(() => {
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });
  });

  test('calls onInputChange when input value changes', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} onInputChange={mockOnInputChange} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'test');

    expect(mockOnInputChange).toHaveBeenCalledWith('test');
  });
});

describe('TypeaheadSelect - keyboard navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('selects option with Enter key', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    await user.click(input);

    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });

  test('closes dropdown with Escape key', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    await user.click(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
