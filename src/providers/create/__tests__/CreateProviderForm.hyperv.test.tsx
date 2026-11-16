import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './setup-provider-form-mocks';

import CreateProviderForm from '../CreateProviderForm';

import { clearAllProviderMocks } from './test-utils';

jest.mock('../fields/ProviderTypeField', () => {
  const { mockCreateProviderTypeField } = jest.requireActual('./test-utils');
  return mockCreateProviderTypeField('hyperv', 'Microsoft Hyper-V');
});

const renderValidHypervForm = async (): Promise<void> => {
  const user = userEvent.setup();
  render(<CreateProviderForm />);

  await user.selectOptions(screen.getByLabelText(/provider type/i), 'hyperv');
  await user.type(await screen.findByTestId('provider-name-input'), 'my-hyperv');
  await user.type(screen.getByLabelText(/smb share url/i), '//server/share');
  await user.type(await screen.findByTestId('hyperv-host-input'), '192.168.1.100');
  await user.type(screen.getByTestId('hyperv-username-input'), 'Administrator');
  await user.type(screen.getByTestId('hyperv-password-input'), 'password');

  await user.click(screen.getByTestId('certificate-validation-skip'));
  await user.click(screen.getByTestId('confirm-skip-certificate-validation'));

  await waitFor(() => {
    expect(screen.getByTestId('provider-create-button')).toBeEnabled();
  });
};

describe('CreateProviderForm - Hyper-V create button enablement', () => {
  beforeEach(() => {
    clearAllProviderMocks();
  });

  it('reenables Create provider after unchecking separate SMB credentials', async () => {
    await renderValidHypervForm();
    const user = userEvent.setup();
    const smbToggle = screen.getByRole('checkbox', {
      name: /use different credentials for smb share/i,
    });

    await user.click(smbToggle);
    await waitFor(() => {
      expect(screen.getByTestId('provider-create-button')).toBeDisabled();
    });

    await user.click(smbToggle);

    await waitFor(() => {
      expect(screen.getByTestId('provider-create-button')).toBeEnabled();
    });
    expect(
      screen.queryByText('SMB username is required when using different credentials'),
    ).not.toBeInTheDocument();
  });
});
