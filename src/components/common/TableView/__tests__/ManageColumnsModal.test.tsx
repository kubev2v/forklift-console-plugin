import type { ResourceField } from '@components/common/utils/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ManageColumnsModal } from '../ManageColumnsModal';

const defaultColumns: ResourceField[] = [
  { isIdentity: true, isVisible: true, label: 'Name', resourceFieldId: 'name' },
  { isVisible: true, label: 'Status', resourceFieldId: 'status' },
  { isAction: true, isVisible: true, label: '', resourceFieldId: 'actions' },
];

type RenderModalResult = {
  onChange: jest.Mock<undefined, [ResourceField[]]>;
  onClose: jest.Mock<undefined, []>;
  user: ReturnType<typeof userEvent.setup>;
};

const renderModal = (resourceFields = defaultColumns): RenderModalResult => {
  const onChange = jest.fn<undefined, [ResourceField[]]>();
  const onClose = jest.fn<undefined, []>();
  render(
    <ManageColumnsModal
      defaultColumns={defaultColumns}
      onChange={onChange}
      onClose={onClose}
      resourceFields={resourceFields}
      showModal
    />,
  );
  return { onChange, onClose, user: userEvent.setup() };
};

describe('ManageColumnsModal restore behavior', () => {
  it('leaves Save disabled when defaults already match', async () => {
    const { onChange, user } = renderModal();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Restore default columns' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('restores visibility and order only after Save', async () => {
    const customized = [
      defaultColumns[1],
      { ...defaultColumns[0], isVisible: true },
      defaultColumns[2],
    ];
    const { onChange, onClose, user } = renderModal(customized);
    await user.click(screen.getByRole('button', { name: 'Restore default columns' }));
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onChange).toHaveBeenCalledWith(defaultColumns);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cancels staged restore without changing the table', async () => {
    const customized = [defaultColumns[1], defaultColumns[0], defaultColumns[2]];
    const { onChange, onClose, user } = renderModal(customized);
    await user.click(screen.getByRole('button', { name: 'Restore default columns' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it.each([true, false])(
    'saves toggled visibility when initially visible is %s',
    async (isVisible) => {
      const columns = defaultColumns.map((field) =>
        field.resourceFieldId === 'status' ? { ...field, isVisible } : field,
      );
      const { onChange, user } = renderModal(columns);
      await user.click(screen.getByRole('checkbox', { name: 'Status' }));
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(onChange).toHaveBeenCalledWith(
        columns.map((field) =>
          field.resourceFieldId === 'status' ? { ...field, isVisible: !isVisible } : field,
        ),
      );
    },
  );

  it('does not change columns when visibility changes are canceled', async () => {
    const { onChange, user } = renderModal();
    await user.click(screen.getByRole('checkbox', { name: 'Status' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('saves a reordered column list', async () => {
    const { onChange, user } = renderModal();
    await user.click(screen.getByRole('button', { name: 'Move Status up' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onChange).toHaveBeenCalledWith([
      defaultColumns[1],
      defaultColumns[0],
      defaultColumns[2],
    ]);
  });
});
