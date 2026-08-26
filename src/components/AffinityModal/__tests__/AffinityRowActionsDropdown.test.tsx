import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import AffinityRowActionsDropdown from '../AffinityRowActionsDropdown';
import { AffinityCondition, AffinityType, type AffinityRowData } from '../utils/types';

const affinity: AffinityRowData = {
  condition: AffinityCondition.Required,
  id: '1',
  type: AffinityType.Node,
};

describe('AffinityRowActionsDropdown', () => {
  it('invokes onEdit for the affinity row', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    render(
      <AffinityRowActionsDropdown affinity={affinity} onDelete={jest.fn()} onEdit={onEdit} />,
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledWith(affinity);
  });

  it('invokes onDelete for the affinity row', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    render(
      <AffinityRowActionsDropdown affinity={affinity} onDelete={onDelete} onEdit={jest.fn()} />,
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(onDelete).toHaveBeenCalledWith(affinity);
  });
});
