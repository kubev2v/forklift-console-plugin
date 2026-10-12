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
  onResetColumnWidths: jest.Mock<undefined, []>;
  user: ReturnType<typeof userEvent.setup>;
};

const renderModal = (resourceFields = defaultColumns): RenderModalResult => {
  const onChange = jest.fn<undefined, [ResourceField[]]>();
  const onClose = jest.fn<undefined, []>();
  const onResetColumnWidths = jest.fn<undefined, []>();
  render(
    <ManageColumnsModal
      defaultColumns={defaultColumns}
      onChange={onChange}
      onClose={onClose}
      onResetColumnWidths={onResetColumnWidths}
      resourceFields={resourceFields}
      showModal
    />,
  );
  return { onChange, onClose, onResetColumnWidths, user: userEvent.setup() };
};

describe('ManageColumnsModal width reset', () => {
  it('defers restoring widths until Save, including when columns already match defaults', async () => {
    const { onChange, onClose, onResetColumnWidths, user } = renderModal();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Restore default columns' }));
    await user.click(screen.getByRole('button', { name: 'Restore default columns' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(onResetColumnWidths).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onChange).toHaveBeenCalledWith(defaultColumns);
    expect(onResetColumnWidths).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not reset widths when restoring defaults is canceled', async () => {
    const { onChange, onClose, onResetColumnWidths, user } = renderModal();
    await user.click(screen.getByRole('button', { name: 'Restore default columns' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(onResetColumnWidths).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it.each([true, false])(
    'preserves saved widths when toggling a column initially visible: %s',
    async (isVisible) => {
      const columns = defaultColumns.map((field) =>
        field.resourceFieldId === 'status' ? { ...field, isVisible } : field,
      );
      const { onChange, onClose, onResetColumnWidths, user } = renderModal(columns);
      await user.click(screen.getByRole('checkbox', { name: 'Status' }));
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onChange).toHaveBeenCalledWith(
        columns.map((field) =>
          field.resourceFieldId === 'status' ? { ...field, isVisible: !isVisible } : field,
        ),
      );
      expect(onResetColumnWidths).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
    },
  );

  it('does not change columns or widths when visibility changes are canceled', async () => {
    const { onChange, onClose, onResetColumnWidths, user } = renderModal();
    await user.click(screen.getByRole('checkbox', { name: 'Status' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(onResetColumnWidths).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('preserves saved widths when reordering columns', async () => {
    const { onChange, onResetColumnWidths, user } = renderModal();
    await user.click(screen.getByRole('button', { name: 'Move Status up' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onChange).toHaveBeenCalledWith([
      defaultColumns[1],
      defaultColumns[0],
      defaultColumns[2],
    ]);
    expect(onResetColumnWidths).not.toHaveBeenCalled();
  });
});
