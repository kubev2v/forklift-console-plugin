import { beforeEach, describe, expect, test } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import TypeaheadSelect from '../TypeaheadSelect';

import { defaultProps, mockOnChange } from './typeaheadSelect.fixtures';

describe('TypeaheadSelect - creatable options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates new option when isCreatable is true', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} isCreatable />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'New Option');

    await waitFor(() => {
      expect(screen.getByText('Create "New Option"')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Create "New Option"'));

    expect(mockOnChange).toHaveBeenCalledWith('New Option');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('shows custom create option message when provided', async () => {
    const user = userEvent.setup();
    const customMessage = (value: string): string => `Add new: ${value}`;
    render(<TypeaheadSelect {...defaultProps} createOptionMessage={customMessage} isCreatable />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Custom Item');

    await waitFor(() => {
      expect(screen.getByText('Add new: Custom Item')).toBeInTheDocument();
    });
  });

  test('prevents creating duplicate options', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} isCreatable />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Option 1');

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Create "Option 1"')).not.toBeInTheDocument();
    });
  });
});

describe('TypeaheadSelect - no options/results messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows custom no options message when no options are provided', async () => {
    const user = userEvent.setup();
    const customMessage = 'Custom no options message';
    render(
      <TypeaheadSelect noOptionsMessage={customMessage} onChange={mockOnChange} options={[]} />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });
  });

  test('shows custom no results message when filtering returns no results', async () => {
    const user = userEvent.setup();
    const customMessage = (filter: string): string => `Custom no results for "${filter}"`;
    render(<TypeaheadSelect {...defaultProps} noResultsMessage={customMessage} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('Custom no results for "nonexistent"')).toBeInTheDocument();
    });
  });
});
