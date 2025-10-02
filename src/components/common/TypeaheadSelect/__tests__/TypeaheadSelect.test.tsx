import { beforeEach, describe, expect, test } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import TypeaheadSelect from '../TypeaheadSelect';
import type { TypeaheadSelectOption } from '../utils/types';

const mockOnChange = jest.fn();
const mockOnInputChange = jest.fn();

describe('TypeaheadSelect', () => {
  const mockOptions: TypeaheadSelectOption[] = [
    { content: 'Option 1', value: 'option1' },
    { content: 'Option 2', value: 'option2' },
    { content: 'Option 3', value: 'option3' },
  ];

  const defaultProps = {
    onChange: mockOnChange,
    options: mockOptions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders with default placeholder', () => {
      render(<TypeaheadSelect {...defaultProps} />);

      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Select an option');
    });

    test('renders with custom placeholder when provided', () => {
      const customPlaceholder = 'Choose an item';
      render(<TypeaheadSelect {...defaultProps} placeholder={customPlaceholder} />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('placeholder', customPlaceholder);
    });

    test('renders with initial value', () => {
      render(<TypeaheadSelect {...defaultProps} value="option2" />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveValue('Option 2');
    });

    test('renders as disabled when isDisabled is true', async () => {
      const user = userEvent.setup();
      render(<TypeaheadSelect {...defaultProps} isDisabled />);

      const input = screen.getByRole('combobox');
      const toggleButton = screen.getByRole('button', { name: /menu toggle/i });

      // Verify that clicking doesn't open the dropdown (functional disabled behavior)
      await user.click(input);
      expect(input).toHaveAttribute('aria-expanded', 'false');

      await user.click(toggleButton);
      expect(input).toHaveAttribute('aria-expanded', 'false');

      // Verify no options are shown (because dropdown didn't open)
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
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
  });

  describe('Selection Clearing', () => {
    test('shows clear button when allowClear is true and value is selected', async () => {
      const user = userEvent.setup();
      render(<TypeaheadSelect {...defaultProps} value="option2" allowClear />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveValue('Option 2');

      // Focus input to make clear button appear
      await user.click(input);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
    });

    test('clears selected value when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<TypeaheadSelect {...defaultProps} value="option2" allowClear />);

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

      // Select first option
      await user.click(input);
      await user.click(screen.getByText('Option 1'));
      expect(mockOnChange).toHaveBeenCalledWith('option1');

      // Re-render with selected value
      rerender(<TypeaheadSelect {...defaultProps} value="option1" allowClear />);

      // Clear the selection
      await user.click(input);
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);
      expect(mockOnChange).toHaveBeenCalledWith('');

      // Re-render cleared state
      rerender(<TypeaheadSelect {...defaultProps} allowClear />);

      // Select different option
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

  describe('Filtering', () => {
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
      const customFilter = (filterValue: string, options: TypeaheadSelectOption[]) =>
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

  describe('Creatable Options', () => {
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
      const customMessage = (value: string) => `Add new: ${value}`;
      render(<TypeaheadSelect {...defaultProps} isCreatable createOptionMessage={customMessage} />);

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

  describe('No Options/Results Messages', () => {
    test('shows custom no options message when no options are provided', async () => {
      const user = userEvent.setup();
      const customMessage = 'Custom no options message';
      render(
        <TypeaheadSelect options={[]} onChange={mockOnChange} noOptionsMessage={customMessage} />,
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText(customMessage)).toBeInTheDocument();
      });
    });

    test('shows custom no results message when filtering returns no results', async () => {
      const user = userEvent.setup();
      const customMessage = (filter: string) => `Custom no results for "${filter}"`;
      render(<TypeaheadSelect {...defaultProps} noResultsMessage={customMessage} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.type(input, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('Custom no results for "nonexistent"')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    test('selects option with Enter key', async () => {
      const user = userEvent.setup();
      render(<TypeaheadSelect {...defaultProps} />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      // Navigate to second option and press Enter
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith('option2');
    });

    test('closes dropdown with Escape key', async () => {
      const user = userEvent.setup();
      render(<TypeaheadSelect {...defaultProps} />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      // Verify dropdown is open
      expect(input).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');

      // Verify dropdown is closed
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Toggle Button', () => {
    test('opens and closes dropdown when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<TypeaheadSelect {...defaultProps} />);

      const input = screen.getByRole('combobox');
      const toggleButton = screen.getByRole('button', { name: /menu toggle/i });

      // Initially closed
      expect(input).toHaveAttribute('aria-expanded', 'false');

      // Click toggle to open
      await user.click(toggleButton);
      expect(input).toHaveAttribute('aria-expanded', 'true');

      // Click toggle to close
      await user.click(toggleButton);
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });
});
