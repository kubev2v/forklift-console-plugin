import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { AttributeKind, type CheckboxAttr } from '../../utils/types';
import FilterValueMultiSelect from '../FilterValueMultiSelect';

type Row = { id: string };

const attribute: CheckboxAttr<Row> = {
  getValues: () => [],
  id: 'power',
  kind: AttributeKind.Checkbox,
  label: 'Power',
  options: [
    { id: 'on', label: 'On' },
    { id: 'off', label: 'Off' },
  ],
};

describe('FilterValueMultiSelect', () => {
  it('shows filter label without badge when nothing is selected', () => {
    render(
      <FilterValueMultiSelect attribute={attribute} onToggle={jest.fn()} selected={new Set()} />,
    );

    expect(screen.getByRole('button')).toHaveTextContent(/Filter by power/i);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('shows selected count badge and toggles options', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();

    render(
      <FilterValueMultiSelect
        attribute={attribute}
        onToggle={onToggle}
        selected={new Set(['on'])}
      />,
    );

    expect(screen.getByText('1')).toBeInTheDocument();

    await user.click(screen.getByRole('button'));
    await screen.findByText('On');
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();

    await user.click(await screen.findByText('Off'));

    expect(onToggle).toHaveBeenCalledWith('off');
  });

  it('closes when closeKey changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <FilterValueMultiSelect
        attribute={attribute}
        closeKey="power"
        onToggle={jest.fn()}
        selected={new Set()}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');

    rerender(
      <FilterValueMultiSelect
        attribute={attribute}
        closeKey="host"
        onToggle={jest.fn()}
        selected={new Set()}
      />,
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });
});
