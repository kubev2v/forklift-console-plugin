import { beforeEach, describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import TypeaheadSelect from '../TypeaheadSelect';

import { defaultProps } from './typeaheadSelect.fixtures';

const getMenuRoot = (listbox: HTMLElement): Element | null =>
  // The PF menu root carries the scrollable modifier but is not exposed to the a11y tree.
  // eslint-disable-next-line testing-library/no-node-access -- the modifier lives on the listbox ancestor
  listbox.closest('.pf-v6-c-menu');

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

  test('opens a scrollable menu by default', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} />);

    await user.click(screen.getByRole('combobox'));

    const menu = getMenuRoot(await screen.findByRole('listbox'));
    expect(menu).not.toBeNull();
    expect(menu).toHaveClass('pf-m-scrollable');
  });

  test('does not mark the menu scrollable when isScrollable is false', async () => {
    const user = userEvent.setup();
    render(<TypeaheadSelect {...defaultProps} isScrollable={false} />);

    await user.click(screen.getByRole('combobox'));

    const menu = getMenuRoot(await screen.findByRole('listbox'));
    expect(menu).not.toBeNull();
    expect(menu).not.toHaveClass('pf-m-scrollable');
  });
});
