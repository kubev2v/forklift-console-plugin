import { beforeEach, describe, expect, test } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import TypeaheadSelect from '../TypeaheadSelect';

import { defaultProps, mockOnChange } from './typeaheadSelect.fixtures';

describe('TypeaheadSelect - interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens dropdown when input is clicked', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await user.click(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  test('selects an option when clicked', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Option 2'));

    expect(mockOnChange).toHaveBeenCalledWith('option2');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('does not open dropdown when disabled', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} isDisabled />);

    const input = screen.getByRole('combobox');
    await user.click(input);

    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test('opens and closes dropdown when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    const toggleButton = screen.getByRole('button', { name: /menu toggle/i });

    expect(input).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleButton);
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggleButton);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
