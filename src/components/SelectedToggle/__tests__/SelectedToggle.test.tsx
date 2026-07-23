import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import SelectedToggle from '@components/SelectedToggle/SelectedToggle';
import { describe, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

describe('SelectedToggle', () => {
  test('disables Selected when no VMs are selected', () => {
    render(<SelectedToggle selectedVmKeys={[]} setShowAll={jest.fn()} showAll />);

    expect(screen.getByRole('button', { name: 'Selected' })).toBeDisabled();
  });

  test('calls setShowAll(false) when Selected is clicked', async () => {
    const user = userEvent.setup();
    const setShowAll = jest.fn();

    render(<SelectedToggle selectedVmKeys={['vm-1']} setShowAll={setShowAll} showAll />);

    await user.click(screen.getByRole('button', { name: 'Selected' }));

    expect(setShowAll).toHaveBeenCalledWith(false);
  });

  test('calls setShowAll(true) when All is clicked', async () => {
    const user = userEvent.setup();
    const setShowAll = jest.fn();

    render(<SelectedToggle selectedVmKeys={['vm-1']} setShowAll={setShowAll} showAll={false} />);

    await user.click(screen.getByRole('button', { name: 'All' }));

    expect(setShowAll).toHaveBeenCalledWith(true);
  });
});
