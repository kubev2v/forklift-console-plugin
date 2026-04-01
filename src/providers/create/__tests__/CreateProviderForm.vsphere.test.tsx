import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './setup-provider-form-mocks';

import CreateProviderForm from '../CreateProviderForm';

import { clearAllProviderMocks } from './test-utils';

jest.mock('../fields/ProviderTypeField', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./test-utils').mockCreateProviderTypeField('vsphere', 'VMware vSphere'),
);

describe('CreateProviderForm - vSphere Provider', () => {
  beforeEach(() => {
    clearAllProviderMocks();
  });

  it('shows vSphere-specific fields after selecting vSphere type', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: /vsphere endpoint/i })).toBeInTheDocument();
      expect(screen.getByTestId('vsphere-url-input')).toBeInTheDocument();
      expect(
        screen.getByRole('radiogroup', {
          name: /virtual disk development kit \(vddk\) setup/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /skip certificate validation/i }),
      ).toBeInTheDocument();
    });

    expect(screen.queryByTestId('vsphere-username-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('vsphere-password-input')).not.toBeInTheDocument();
  });

  it('shows credentials fields when URL is provided', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');

    await waitFor(() => {
      expect(screen.getByTestId('vsphere-url-input')).toBeInTheDocument();
    });

    const urlInput = screen.getByTestId('vsphere-url-input');
    await user.type(urlInput, 'https://vcenter.example.com/sdk');

    await waitFor(() => {
      expect(screen.getByTestId('vsphere-username-input')).toBeInTheDocument();
      expect(screen.getByTestId('vsphere-password-input')).toBeInTheDocument();
    });
  });

  it('shows vCenter endpoint option by default', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');

    await waitFor(() => {
      const vcenterRadio = screen.getByTestId('vsphere-endpoint-vcenter-radio');
      expect(vcenterRadio).toBeChecked();
    });
  });

  it('shows no VDDK option selected by default', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');

    await waitFor(() => {
      const uploadRadio = screen.getByTestId('vddk-setup-upload-radio');
      const manualRadio = screen.getByTestId('vddk-setup-manual-radio');
      const skipRadio = screen.getByTestId('vddk-setup-skip-radio');

      expect(uploadRadio).not.toBeChecked();
      expect(manualRadio).not.toBeChecked();
      expect(skipRadio).not.toBeChecked();
    });
  });

  it('hides other provider fields when vSphere provider is selected', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('textbox', { name: /service account bearer token/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/nfs shared directory/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('openstack-url-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ovirt-url-input')).not.toBeInTheDocument();
  });
});
