import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { MemoryRouter } from 'react-router';
import { OverviewContextProvider } from 'src/overview/context/OverviewContext';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import WelcomeCard from '../WelcomeCard';

const mockUseClusterIsAwsPlatform = jest.fn<() => boolean>();

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

  it('shows Amazon EC2 provider tile on AWS-platform clusters', () => {
    mockUseClusterIsAwsPlatform.mockReturnValue(true);

    renderWelcomeCard();

    expect(screen.getByText('Amazon EC2')).toBeVisible();
  });

  it('hides Amazon EC2 provider tile on non-AWS clusters', () => {
    mockUseClusterIsAwsPlatform.mockReturnValue(false);

    renderWelcomeCard();

    expect(screen.queryByText('Amazon EC2')).not.toBeInTheDocument();
  });

  it('always shows the core provider tiles', () => {
    mockUseClusterIsAwsPlatform.mockReturnValue(false);

    renderWelcomeCard();

    expect(screen.getByText('VMware')).toBeVisible();
    expect(screen.getByText('Open Virtual Appliance')).toBeVisible();
    expect(screen.getByText('OpenStack')).toBeVisible();
    expect(screen.getByText('Microsoft Hyper-V')).toBeVisible();
    expect(screen.getByText('Red Hat Virtualization')).toBeVisible();
    expect(screen.getByText('OpenShift Virtualization')).toBeVisible();
  });
});
