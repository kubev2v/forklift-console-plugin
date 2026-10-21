import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { ProviderModelRef } from '@forklift-ui/types';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import ProvidersAddButton from '../ProvidersAddButton';

const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
  ...jest.requireActual<Record<string, unknown>>('react-router'),
  useNavigate: (): typeof mockNavigate => mockNavigate,
}));

jest.mock('@utils/analytics/hooks/useForkliftAnalytics', () => ({
  useForkliftAnalytics: (): { trackEvent: jest.Mock } => ({ trackEvent: jest.fn() }),
}));

describe('ProvidersAddButton', () => {
  it('opens the cluster-scoped create route from a selected project', async () => {
    const user = userEvent.setup();
    render(<ProvidersAddButton canCreate namespace="source-project" />);

    await user.click(screen.getByRole('button', { name: 'Create provider' }));

    expect(mockNavigate).toHaveBeenCalledWith(`/k8s/cluster/${ProviderModelRef}/~new`);
  });
});
