import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import useShowSelectedVmsToggle from '@components/SelectedToggle/useShowSelectedVmsToggle';
import { describe, expect, test } from '@jest/globals';
import { render, renderHook, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

describe('useShowSelectedVmsToggle', () => {
  test('returns showSelectedOnly false by default when enabled', () => {
    const { result } = renderHook(() => useShowSelectedVmsToggle(true, ['vm-1']));

    expect(result.current.showSelectedOnly).toBe(false);
    expect(result.current.GlobalActionToolbarItems).toHaveLength(1);
  });

  test('returns undefined toolbar items when disabled', () => {
    const { result } = renderHook(() => useShowSelectedVmsToggle(false, ['vm-1']));

    expect(result.current.showSelectedOnly).toBe(false);
    expect(result.current.GlobalActionToolbarItems).toBeUndefined();
  });

  test('toggles to showSelectedOnly when Selected is clicked', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useShowSelectedVmsToggle(true, ['vm-1']));
    const [Action] = result.current.GlobalActionToolbarItems!;

    render(<Action dataOnScreen={[]} selectedIds={['vm-1']} />);
    await user.click(screen.getByRole('button', { name: 'Selected' }));

    expect(result.current.showSelectedOnly).toBe(true);
  });

  test('resets to show all when selection becomes empty', async () => {
    const user = userEvent.setup();
    const { result, rerender } = renderHook(
      ({ selectedIds }) => useShowSelectedVmsToggle(true, selectedIds),
      { initialProps: { selectedIds: ['vm-1'] } },
    );

    const [Action] = result.current.GlobalActionToolbarItems!;
    const { rerender: rerenderAction } = render(
      <Action dataOnScreen={[]} selectedIds={['vm-1']} />,
    );

    await user.click(screen.getByRole('button', { name: 'Selected' }));
    expect(result.current.showSelectedOnly).toBe(true);

    rerender({ selectedIds: [] });
    rerenderAction(<Action dataOnScreen={[]} selectedIds={[]} />);

    expect(result.current.showSelectedOnly).toBe(false);
  });
});
