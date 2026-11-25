import { MemoryRouter } from 'react-router';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import type { MigrationAlert } from '@utils/hooks/useMigrationAlerts/types';

import MigrationAlertsCard from '../MigrationAlertsCard';

import { failedAlert, succeededAlert } from './MigrationAlertsCard.fixtures';

const mockUseMigrationAlerts =
  jest.fn<() => { alerts: MigrationAlert[]; error: unknown; loaded: boolean }>();

jest.mock('@utils/hooks/useMigrationAlerts/useMigrationAlerts', () => ({
  __esModule: true,
  default: (): ReturnType<typeof mockUseMigrationAlerts> => mockUseMigrationAlerts(),
}));

jest.mock('src/utils/i18n', () => {
  const mockT = (key: string): string => key;
  return {
    ForkliftTrans: ({ children }: { children: unknown }): unknown => children,
    t: mockT,
    useForkliftTranslation: (): { t: typeof mockT } => ({ t: mockT }),
  };
});

jest.mock('@utils/i18n', () => {
  const mockT = (key: string): string => key;
  return {
    ForkliftTrans: ({ children }: { children: unknown }): unknown => children,
    t: mockT,
    useForkliftTranslation: (): { t: typeof mockT } => ({ t: mockT }),
  };
});

const renderCard = (): ReturnType<typeof render> =>
  render(
    <MemoryRouter>
      <MigrationAlertsCard />
    </MemoryRouter>,
  );

describe('MigrationAlertsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state message when no alerts are firing', () => {
    mockUseMigrationAlerts.mockReturnValue({ alerts: [], error: undefined, loaded: true });

    renderCard();

    expect(screen.getByText('No migrations have completed or failed yet.')).toBeInTheDocument();
  });

  it('shows loading spinner when not yet loaded', () => {
    mockUseMigrationAlerts.mockReturnValue({ alerts: [], error: undefined, loaded: false });

    renderCard();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders card title', () => {
    mockUseMigrationAlerts.mockReturnValue({
      alerts: [failedAlert, succeededAlert],
      error: undefined,
      loaded: true,
    });

    renderCard();

    expect(screen.getByText('Migration plan alerts')).toBeInTheDocument();
  });

  it('shows summary section with failed and succeeded counts', () => {
    mockUseMigrationAlerts.mockReturnValue({
      alerts: [failedAlert, succeededAlert],
      error: undefined,
      loaded: true,
    });

    renderCard();

    expect(screen.getByText('Failed', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('Succeeded', { exact: true })).toBeInTheDocument();

    const summaryCounts = screen.getAllByText('1');
    expect(summaryCounts).toHaveLength(2);
  });

  it('renders alert list items with titles', () => {
    mockUseMigrationAlerts.mockReturnValue({
      alerts: [failedAlert, succeededAlert],
      error: undefined,
      loaded: true,
    });

    renderCard();

    expect(screen.getByText('MigrationFailed')).toBeInTheDocument();
    expect(screen.getByText('MigrationSucceeded')).toBeInTheDocument();
  });

  it('renders alert descriptions', () => {
    mockUseMigrationAlerts.mockReturnValue({
      alerts: [failedAlert],
      error: undefined,
      loaded: true,
    });

    renderCard();

    expect(
      screen.getByText(
        'Cold migration plan "plan-alpha" with VSphere provider failed on DiskTransfer phase.',
      ),
    ).toBeInTheDocument();
  });

  it('renders "View details" links for each alert', () => {
    mockUseMigrationAlerts.mockReturnValue({
      alerts: [failedAlert, succeededAlert],
      error: undefined,
      loaded: true,
    });

    renderCard();

    const detailLinks = screen.getAllByRole('link', { name: 'View details' });
    expect(detailLinks).toHaveLength(2);
    expect(detailLinks[0]).toHaveAttribute('href', '/monitoring/alerts?alertname=MigrationFailed');
  });

  it('shows error state instead of empty state when alerts fail to load', () => {
    mockUseMigrationAlerts.mockReturnValue({
      alerts: [],
      error: new Error('Service Unavailable'),
      loaded: true,
    });

    renderCard();

    expect(screen.getByText('Unable to load migration alerts')).toBeInTheDocument();
    expect(screen.queryByText('No migrations have completed or failed yet.')).toBeNull();
  });

  it('shows error state instead of spinner when error is set before load completes', () => {
    mockUseMigrationAlerts.mockReturnValue({
      alerts: [],
      error: new Error('Forbidden'),
      loaded: false,
    });

    renderCard();

    expect(screen.getByText('Unable to load migration alerts')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('hides summary counts and stale alerts when an error is present', () => {
    mockUseMigrationAlerts.mockReturnValue({
      alerts: [failedAlert],
      error: new Error('Service Unavailable'),
      loaded: true,
    });

    renderCard();

    expect(screen.getByText('Unable to load migration alerts')).toBeInTheDocument();
    expect(screen.queryByText('Failed', { exact: true })).toBeNull();
    expect(screen.queryByText('MigrationFailed')).toBeNull();
    expect(screen.getByRole('link', { name: 'View alerts' })).toBeInTheDocument();
  });

  it('renders "View alerts" link in header', () => {
    mockUseMigrationAlerts.mockReturnValue({
      alerts: [failedAlert],
      error: undefined,
      loaded: true,
    });

    renderCard();

    expect(screen.getByRole('link', { name: 'View alerts' })).toHaveAttribute(
      'href',
      '/monitoring/alerts',
    );
  });
});
