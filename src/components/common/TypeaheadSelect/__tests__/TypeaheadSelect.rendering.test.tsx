import { beforeEach, describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import TypeaheadSelect from '../TypeaheadSelect';

import { defaultProps } from './typeaheadSelect.fixtures';

describe('TypeaheadSelect - rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  test('shows controlled value while options are still empty', () => {
    render(<TypeaheadSelect {...defaultProps} options={[]} value="luks-test-secret" />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('luks-test-secret');
  });

  test('renders as disabled when isDisabled is true', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} isDisabled />);

    const input = screen.getByRole('combobox');
    const toggleButton = screen.getByRole('button', { name: /menu toggle/i });

    await user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleButton);
    expect(input).toHaveAttribute('aria-expanded', 'false');

    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });
});
