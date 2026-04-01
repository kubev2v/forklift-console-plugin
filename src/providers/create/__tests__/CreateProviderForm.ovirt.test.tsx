import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './setup-provider-form-mocks';

import CreateProviderForm from '../CreateProviderForm';

import { clearAllProviderMocks } from './test-utils';

jest.mock('../fields/ProviderTypeField', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./test-utils').mockCreateProviderTypeField('ovirt', 'Red Hat Virtualization'),
);

describe('CreateProviderForm - oVirt Provider', () => {
  beforeEach(() => {
    clearAllProviderMocks();
  });

  it('shows oVirt-specific fields after selecting oVirt type', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'ovirt');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
      expect(screen.getByTestId('ovirt-url-input')).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /skip certificate validation/i }),
      ).toBeInTheDocument();
    });

    expect(screen.queryByTestId('ovirt-username-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ovirt-password-input')).not.toBeInTheDocument();
  });

  it('shows credentials fields when URL is provided', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'ovirt');

    await waitFor(() => {
      expect(screen.getByTestId('ovirt-url-input')).toBeInTheDocument();
    });

    const urlInput = screen.getByTestId('ovirt-url-input');
    await user.type(urlInput, 'https://rhv.example.com/ovirt-engine/api');

    await waitFor(() => {
      expect(screen.getByTestId('ovirt-username-input')).toBeInTheDocument();
      expect(screen.getByTestId('ovirt-password-input')).toBeInTheDocument();
    });
  });

  it('hides other provider fields when oVirt provider is selected', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'ovirt');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('textbox', { name: /service account bearer token/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/nfs shared directory/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('openstack-url-input')).not.toBeInTheDocument();
  });
});
