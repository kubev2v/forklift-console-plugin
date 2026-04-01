import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './setup-provider-form-mocks';

import CreateProviderForm from '../CreateProviderForm';

import { clearAllProviderMocks } from './test-utils';

jest.mock('../fields/ProviderTypeField', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./test-utils').mockCreateProviderTypeField('openshift', 'OpenShift Virtualization'),
);

describe('CreateProviderForm - OpenShift Provider', () => {
  beforeEach(() => {
    clearAllProviderMocks();
  });

  describe('Initial rendering', () => {
    it('renders provider project and provider type fields', () => {
      render(<CreateProviderForm />);

      expect(screen.getByText('Provider project')).toBeInTheDocument();
      expect(screen.getByLabelText(/provider type/i)).toBeInTheDocument();
    });

    it('disables create button when form is invalid', () => {
      render(<CreateProviderForm />);

      const submitButton = screen.getByRole('button', { name: /create provider/i });
      expect(submitButton).toBeDisabled();
    });

    it('does not show provider name field before selecting type', () => {
      render(<CreateProviderForm />);

      expect(screen.queryByRole('textbox', { name: /provider name/i })).not.toBeInTheDocument();
    });
  });

  it('shows OpenShift-specific fields after selecting OpenShift type', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'openshift');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /api endpoint url/i })).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /skip certificate validation/i }),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('textbox', { name: /service account bearer token/i }),
    ).not.toBeInTheDocument();
  });

  it('shows bearer token field when URL is provided for remote cluster', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'openshift');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /api endpoint url/i })).toBeInTheDocument();
    });

    const urlInput = screen.getByRole('textbox', { name: /api endpoint url/i });
    await user.type(urlInput, 'https://api.example.com:6443');

    await waitFor(() => {
      expect(screen.getByTestId('service-account-token-input')).toBeInTheDocument();
    });
  });

  it('hides OVA fields when OpenShift provider is selected', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'openshift');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /api endpoint url/i })).toBeInTheDocument();
    });

    expect(screen.queryByLabelText(/nfs shared directory/i)).not.toBeInTheDocument();
  });
});
