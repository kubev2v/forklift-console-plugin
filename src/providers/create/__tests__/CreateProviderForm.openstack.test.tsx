import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './setup-provider-form-mocks';

import CreateProviderForm from '../CreateProviderForm';

import { clearAllProviderMocks } from './test-utils';

jest.mock('../fields/ProviderTypeField', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./test-utils').mockCreateProviderTypeField('openstack', 'OpenStack'),
);

describe('CreateProviderForm - OpenStack Provider', () => {
  beforeEach(() => {
    clearAllProviderMocks();
  });

  it('shows OpenStack-specific fields after selecting OpenStack type', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'openstack');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
      expect(screen.getByTestId('openstack-url-input')).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: /authentication type/i })).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /skip certificate validation/i }),
      ).toBeInTheDocument();
    });
  });

  it('shows password authentication fields by default', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'openstack');

    await waitFor(() => {
      expect(screen.getByTestId('openstack-username-input')).toBeInTheDocument();
      expect(screen.getByTestId('openstack-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('openstack-region-input')).toBeInTheDocument();
      expect(screen.getByTestId('openstack-project-input')).toBeInTheDocument();
      expect(screen.getByTestId('openstack-domain-input')).toBeInTheDocument();
    });
  });

  it('hides OpenShift and OVA fields when OpenStack provider is selected', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'openstack');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('textbox', { name: /service account bearer token/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/nfs shared directory/i)).not.toBeInTheDocument();
  });
});
