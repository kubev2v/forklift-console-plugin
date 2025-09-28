import { MemoryRouter } from 'react-router-dom-v5-compat';

import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RoutedTabs from '../RoutedTabs';

const mockNavigate = jest.fn();

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (tabs: any[], initialPath = '/overview') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <RoutedTabs tabs={tabs} />
    </MemoryRouter>,
  );

describe('RoutedTabs', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tabs with correct names', () => {
    const tabs = [
      { name: 'Overview', to: '/overview' },
      { name: 'Settings', to: '/settings' },
    ];
    renderWithRouter(tabs);

    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument();
  });

  it('shows active tab based on current path', () => {
    const tabs = [
      { name: 'Overview', to: '/overview' },
      { name: 'Settings', to: '/settings' },
    ];
    renderWithRouter(tabs, '/settings');

    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false');
  });

  it('defaults to first tab when path does not match', () => {
    const tabs = [
      { name: 'Overview', to: '/overview' },
      { name: 'Settings', to: '/settings' },
    ];
    renderWithRouter(tabs, '/unknown');

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates when tab is clicked', async () => {
    const user = userEvent.setup();
    const tabs = [
      { name: 'Overview', to: '/overview' },
      { name: 'Settings', to: '/settings' },
    ];
    renderWithRouter(tabs, '/overview');

    await user.click(screen.getByRole('tab', { name: 'Settings' }));

    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('calls onClick handler when provided', async () => {
    const user = userEvent.setup();
    const tabs = [
      { name: 'Overview', to: '/overview' },
      { name: 'Settings', to: '/settings', onClick: mockOnClick },
    ];
    renderWithRouter(tabs, '/overview');

    await user.click(screen.getByRole('tab', { name: 'Settings' }));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('handles empty tabs array', () => {
    expect(() => renderWithRouter([])).toThrow();
  });
});
