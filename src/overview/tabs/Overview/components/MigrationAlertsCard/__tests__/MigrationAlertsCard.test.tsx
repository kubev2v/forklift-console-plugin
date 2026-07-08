import { MemoryRouter } from 'react-router-dom-v5-compat';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import type { MigrationAlert } from '@utils/hooks/useMigrationAlerts/types';

const mockUseMigrationAlerts =
  jest.fn<() => { alerts: MigrationAlert[]; error: unknown; loaded: boolean }>();

jest.mock('@utils/hooks/useMigrationAlerts/useMigrationAlerts', () => ({
  __esModule: true,
  default: () => mockUseMigrationAlerts(),
}));

const mockT = (key: string): string => key;

jest.mock('src/utils/i18n', () => ({
  ForkliftTrans: ({ children }: { children: unknown }) => children,
  t: mockT,
  useForkliftTranslation: () => ({ t: mockT }),
}));

jest.mock('@utils/i18n', () => ({
  ForkliftTrans: ({ children }: { children: unknown }) => children,
  t: mockT,
  useForkliftTranslation: () => ({ t: mockT }),
}));

// Must import after mocks
// eslint-disable-next-line import/first
import MigrationAlertsCard from '../MigrationAlertsCard';

const failedAlert: MigrationAlert = {
  activeAt: '2026-06-23T14:30:00Z',
  alertName: 'MigrationFailed',
  description:
    'Cold migration plan "plan-alpha" with VSphere provider failed on DiskTransfer phase.',
  mode: 'Cold',
  phase: 'DiskTransfer',
  planName: 'plan-alpha',
  planUid: 'uid-1',
  provider: 'VSphere',
  severity: 'critical',
  state: 'firing',
  target: 'Local',
};

const succeededAlert: MigrationAlert = {
  activeAt: '2026-06-24T10:00:00Z',
  alertName: 'MigrationSucceeded',
  description: 'Migration plan "plan-beta" succeeded.',
  mode: 'Warm',
  phase: '',
  planName: 'plan-beta',
  planUid: 'uid-2',
  provider: 'oVirt',
  severity: 'info',
  state: 'firing',
  target: 'Local',
};

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

  it('renders card title with total count', () => {
    mockUseMigrationAlerts.mockReturnValue({
      alerts: [failedAlert, succeededAlert],
      error: undefined,
      loaded: true,
    });

    renderCard();

    expect(screen.getByText('Migration plan alerts')).toBeInTheDocument();
    expect(
      screen
        .getByTestId('migration-alerts-card')
        .querySelector('.migration-alerts-card__total-count')?.textContent,
    ).toBe('2');
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

    const counts = document.querySelectorAll('.migration-alerts-card__summary-count');
    expect(counts[0]?.textContent).toBe('1');
    expect(counts[1]?.textContent).toBe('1');
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

    const detailLinks = screen.getAllByText('View details');
    expect(detailLinks).toHaveLength(2);
    expect(detailLinks[0].closest('a')?.getAttribute('href')).toBe(
      '/monitoring/alerts?alertname=MigrationFailed',
    );
  });

  it('renders "View alerts" link in header', () => {
    mockUseMigrationAlerts.mockReturnValue({
      alerts: [failedAlert],
      error: undefined,
      loaded: true,
    });

    renderCard();

    const viewAlertsLink = screen.getByText('View alerts');
    expect(viewAlertsLink.closest('a')?.getAttribute('href')).toBe('/monitoring/alerts');
  });
});
