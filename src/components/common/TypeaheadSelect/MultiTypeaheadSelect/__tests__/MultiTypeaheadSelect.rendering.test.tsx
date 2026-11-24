import { describe, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import type { TypeaheadSelectOption } from '../../utils/types';
import MultiTypeaheadSelect from '../MultiTypeaheadSelect';

const options: TypeaheadSelectOption[] = [
  { content: 'Option 1', value: 'option1' },
  { content: 'Option 2', value: 'option2' },
];

const mockOnChange = jest.fn();
const defaultProps = { onChange: mockOnChange, options };

const openMenu = async (): Promise<Element | null> => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox'));

  const listbox = await screen.findByRole('listbox');

  // The PF menu root carries the scrollable modifier but is not exposed to the a11y tree.
  // eslint-disable-next-line testing-library/no-node-access -- the modifier lives on the listbox ancestor
  return listbox.closest('.pf-v6-c-menu');
};

describe('MultiTypeaheadSelect - rendering', () => {
  test('opens a scrollable menu by default', async () => {
    render(<MultiTypeaheadSelect {...defaultProps} />);

    const menu = await openMenu();
    expect(menu).not.toBeNull();
    expect(menu).toHaveClass('pf-m-scrollable');
  });

  test('does not mark the menu scrollable when isScrollable is false', async () => {
    render(<MultiTypeaheadSelect {...defaultProps} isScrollable={false} />);

    const menu = await openMenu();
    expect(menu).not.toBeNull();
    expect(menu).not.toHaveClass('pf-m-scrollable');
  });
});
