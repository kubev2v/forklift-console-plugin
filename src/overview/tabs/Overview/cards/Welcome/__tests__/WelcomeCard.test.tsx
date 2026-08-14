import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { MemoryRouter } from 'react-router';
import { OverviewContextProvider } from 'src/overview/context/OverviewContext';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import WelcomeCard from '../WelcomeCard';

const mockNavigate = jest.fn();
const mockUseClusterIsAwsPlatform = jest.fn<() => { isAwsPlatform: boolean; loaded: boolean }>();

jest.mock('react-router', () => ({
  ...jest.requireActual<Record<string, unknown>>('react-router'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@utils/hooks/useClusterIsAwsPlatform', () => ({
  useClusterIsAwsPlatform: () => mockUseClusterIsAwsPlatform(),
}));

jest.mock('@utils/hooks/useIsDarkTheme', () => ({
  useIsDarkTheme: () => false,
}));

jest.mock('@utils/analytics/hooks/useForkliftAnalytics', () => ({
  useForkliftAnalytics: () => ({ trackEvent: jest.fn() }),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useActiveNamespace: () => ['test-ns'],
  useFlag: () => true,
}));

const CORE_PROVIDER_TITLES = [
  'OpenShift Virtualization',
  'OpenStack',
  'Open Virtual Appliance',
  'Microsoft Hyper-V',
  'Red Hat Virtualization',
  'VMware vSphere',
] as const;

const renderWelcomeCard = (): ReturnType<typeof render> =>
  render(
    <MemoryRouter>
      <OverviewContextProvider value={{ setData: jest.fn() }}>
        <WelcomeCard />
      </OverviewContextProvider>
    </MemoryRouter>,
  );

describe('WelcomeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows Amazon EC2 and all core provider tiles on AWS-platform clusters', () => {
    mockUseClusterIsAwsPlatform.mockReturnValue({ isAwsPlatform: true, loaded: true });

    renderWelcomeCard();

    expect(screen.getByText('Amazon EC2')).toBeVisible();
    for (const title of CORE_PROVIDER_TITLES) {
      expect(screen.getByText(title)).toBeVisible();
    }
  });

  it('hides Amazon EC2 provider tile on non-AWS clusters', () => {
    mockUseClusterIsAwsPlatform.mockReturnValue({ isAwsPlatform: false, loaded: true });

    renderWelcomeCard();

    expect(screen.queryByText('Amazon EC2')).not.toBeInTheDocument();
  });

  it('always shows the core provider tiles', () => {
    mockUseClusterIsAwsPlatform.mockReturnValue({ isAwsPlatform: false, loaded: true });

    renderWelcomeCard();

    for (const title of CORE_PROVIDER_TITLES) {
      expect(screen.getByText(title)).toBeVisible();
    }
  });

  it('shows core provider tiles while AWS platform status is loading and hides EC2', () => {
    mockUseClusterIsAwsPlatform.mockReturnValue({ isAwsPlatform: false, loaded: false });

    renderWelcomeCard();

    expect(screen.queryByText('Amazon EC2')).not.toBeInTheDocument();
    for (const title of CORE_PROVIDER_TITLES) {
      expect(screen.getByText(title)).toBeVisible();
    }
  });

  it('navigates to create provider with EC2 type when the EC2 tile is clicked', async () => {
    const user = userEvent.setup();
    mockUseClusterIsAwsPlatform.mockReturnValue({ isAwsPlatform: true, loaded: true });

    renderWelcomeCard();

    await user.click(screen.getByRole('button', { name: 'Amazon EC2' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(`?providerType=${PROVIDER_TYPES.ec2}`),
    );
  });
});
