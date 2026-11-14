import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { type UserEvent, userEvent } from '@testing-library/user-event';

import './setup-provider-form-mocks';

import CreateProviderForm from '../CreateProviderForm';

import { clearAllProviderMocks } from './test-utils';

jest.mock('../fields/ProviderTypeField', () => {
  const { mockCreateProviderTypeField } = jest.requireActual('./test-utils');
  return mockCreateProviderTypeField('ec2', 'Amazon EC2');
});

const AZ_REQUIRED = 'Target availability zone is required';

const fillEc2Fields = async (user: UserEvent, options?: { az?: string }): Promise<void> => {
  await user.type(await screen.findByTestId('provider-name-input'), 'my-ec2');
  await user.type(screen.getByTestId('ec2-region-input'), 'us-east-1');
  await user.type(screen.getByTestId('ec2-access-key-id-input'), 'AKIA');
  await user.type(screen.getByTestId('ec2-secret-access-key-input'), 'secret');
  if (options?.az) {
    await user.type(screen.getByTestId('ec2-target-az-input'), options.az);
  }
};

const fillEc2Form = async (user: UserEvent, options?: { az?: string }): Promise<void> => {
  await user.selectOptions(screen.getByLabelText(/provider type/i), 'ec2');
  await fillEc2Fields(user, options);
};

const createButton = (): HTMLElement => screen.getByTestId('provider-create-button');
const autoDetectCheckbox = (): HTMLElement =>
  screen.getByTestId('ec2-auto-target-credentials-checkbox');

describe('CreateProviderForm - EC2 create button enablement', () => {
  beforeEach(() => {
    clearAllProviderMocks();
  });

  it('enables Create provider when auto-detect is checked last (exact report)', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);
    await fillEc2Form(user);

    await user.click(autoDetectCheckbox());

    await waitFor(() => {
      expect(createButton()).toBeEnabled();
    });
    expect(screen.queryByTestId('ec2-target-az-input')).not.toBeInTheDocument();
  });

  it('enables Create provider when auto-detect is checked before filling the form', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);
    await user.selectOptions(screen.getByLabelText(/provider type/i), 'ec2');
    await user.click(autoDetectCheckbox());
    await fillEc2Fields(user);

    await waitFor(() => {
      expect(createButton()).toBeEnabled();
    });
  });

  it('keeps Create provider disabled until the target AZ is filled in manual mode', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);
    await fillEc2Form(user);

    expect(createButton()).toBeDisabled();

    await user.type(screen.getByTestId('ec2-target-az-input'), 'us-east-1a');

    await waitFor(() => {
      expect(createButton()).toBeEnabled();
    });
  });

  it('returns to an enabled form when cross-account credentials are toggled off', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);
    await fillEc2Form(user, { az: 'us-east-1a' });
    const crossAccount = screen.getByTestId('ec2-cross-account-credentials-checkbox');

    await user.click(crossAccount);
    await waitFor(() => {
      expect(createButton()).toBeDisabled();
    });

    await user.click(crossAccount);

    await waitFor(() => {
      expect(createButton()).toBeEnabled();
    });
    expect(
      screen.queryByText('Target access key ID is required when using cross-account credentials'),
    ).not.toBeInTheDocument();
  });

  it('leaves no ghost AZ error after toggling auto-detect off and on', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);
    await fillEc2Form(user, { az: 'us-east-1a' });

    await user.click(autoDetectCheckbox());
    await waitFor(() => {
      expect(createButton()).toBeEnabled();
    });
    await user.click(autoDetectCheckbox());
    await waitFor(() => {
      expect(createButton()).toBeDisabled();
    });
    await user.click(autoDetectCheckbox());

    await waitFor(() => {
      expect(createButton()).toBeEnabled();
    });
    expect(screen.queryByText(AZ_REQUIRED)).not.toBeInTheDocument();
  });
});
