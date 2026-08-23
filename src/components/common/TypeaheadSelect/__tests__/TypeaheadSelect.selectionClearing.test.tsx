import { beforeEach, describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import TypeaheadSelect from '../TypeaheadSelect';

import { defaultProps, mockOnChange } from './typeaheadSelect.fixtures';

describe('TypeaheadSelect - selection clearing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows clear button when allowClear is true and value is selected', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} allowClear value="option2" />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('Option 2');

    await user.click(input);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });

  test('clears selected value when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} allowClear value="option2" />);

    const input = screen.getByRole('combobox');
    await user.click(input);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  test('handles select, clear, and select workflow', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TypeaheadSelect {...defaultProps} allowClear />);

    const input = screen.getByRole('combobox');

    await user.click(input);
    await user.click(screen.getByText('Option 1'));
    expect(mockOnChange).toHaveBeenCalledWith('option1');

    rerender(<TypeaheadSelect {...defaultProps} allowClear value="option1" />);

    await user.click(input);
    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);
    expect(mockOnChange).toHaveBeenCalledWith('');

    rerender(<TypeaheadSelect {...defaultProps} allowClear />);

    await user.click(input);
    await user.click(screen.getByText('Option 3'));
    expect(mockOnChange).toHaveBeenCalledWith('option3');
  });

  test('clears selection when input is manually cleared', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} value="option1" />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('Option 1');

    await user.click(input);
    await user.clear(input);

    expect(mockOnChange).toHaveBeenCalledWith('');
  });
});
