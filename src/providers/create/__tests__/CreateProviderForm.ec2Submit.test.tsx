import { decode } from 'js-base64';

import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './setup-provider-form-mocks';

import CreateProviderForm from '../CreateProviderForm';
import type { Ec2ResolvedTarget } from '../types';
import { Ec2TargetResolutionError } from '../utils/ec2TargetResolutionError';
import { resolveEc2TargetSettings } from '../utils/resolveEc2TargetSettings';

import {
  clearAllProviderMocks,
  mockCreateProvider,
  mockCreateProviderSecret,
  mockNavigate,
} from './test-utils';

jest.mock('../utils/resolveEc2TargetSettings', () => ({
  resolveEc2TargetSettings: jest.fn(),
}));

jest.mock('../fields/ProviderTypeField', () => {
  const { mockCreateProviderTypeField } = jest.requireActual('./test-utils');
  return mockCreateProviderTypeField('ec2', 'Amazon EC2');
});

const mockedResolve = jest.mocked(resolveEc2TargetSettings);

const fillAndEnableAutoDetect = async (): Promise<void> => {
  const user = userEvent.setup();
  render(<CreateProviderForm />);

  await user.selectOptions(screen.getByLabelText(/provider type/i), 'ec2');
  await user.type(await screen.findByTestId('provider-name-input'), 'my-ec2');
  await user.type(screen.getByTestId('ec2-region-input'), 'us-east-1');
  await user.type(screen.getByTestId('ec2-access-key-id-input'), 'AKIA');
  await user.type(screen.getByTestId('ec2-secret-access-key-input'), 'source-secret');
  await user.click(screen.getByTestId('ec2-auto-target-credentials-checkbox'));

  await waitFor(() => {
    expect(screen.getByTestId('provider-create-button')).toBeEnabled();
  });
};

const submit = async (): Promise<void> => {
  const user = userEvent.setup();
  await user.click(screen.getByTestId('provider-create-button'));
};

describe('CreateProviderForm - EC2 submit', () => {
  beforeEach(() => {
    clearAllProviderMocks();
    mockedResolve.mockReset();
    mockCreateProviderSecret.mockResolvedValue({
      metadata: { name: 'my-ec2-secret', namespace: 'test-namespace' },
    });
    mockCreateProvider.mockResolvedValue({
      metadata: { name: 'my-ec2', namespace: 'test-namespace' },
    });
  });

  it('creates the provider with the resolved target settings', async () => {
    mockedResolve.mockResolvedValue({
      targetAccessKeyId: 'CLUSTERKEY',
      targetAz: 'us-east-1a',
      targetRegion: 'us-east-1',
      targetSecretAccessKey: 'cluster-secret',
    });
    await fillAndEnableAutoDetect();

    await submit();

    await waitFor(() => {
      expect(mockCreateProvider).toHaveBeenCalledTimes(1);
    });

    const provider = mockCreateProvider.mock.calls[0][0] as {
      spec?: { settings?: Record<string, string> };
    };
    const secret = mockCreateProviderSecret.mock.calls[0][1] as {
      data?: Record<string, string>;
    };

    expect(provider.spec?.settings?.['target-az']).toBe('us-east-1a');
    expect(provider.spec?.settings?.['target-region']).toBe('us-east-1');
    expect(decode(secret.data?.targetAccessKeyId ?? '')).toBe('CLUSTERKEY');
    expect(decode(secret.data?.targetSecretAccessKey ?? '')).toBe('cluster-secret');
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('shows the resolution error alert without creating the provider', async () => {
    mockedResolve.mockRejectedValue(new Ec2TargetResolutionError('secretForbidden'));
    await fillAndEnableAutoDetect();

    await submit();

    expect(await screen.findByText('Could not auto-detect target settings')).toBeInTheDocument();
    expect(mockCreateProvider).not.toHaveBeenCalled();
    expect(screen.getByTestId('ec2-region-input')).toHaveValue('us-east-1');
    await waitFor(() => {
      expect(screen.getByTestId('provider-create-button')).toBeEnabled();
    });
  });

  it('moves to manual target settings from the alert action', async () => {
    mockedResolve.mockRejectedValue(new Ec2TargetResolutionError('nodesForbidden'));
    await fillAndEnableAutoDetect();
    await submit();

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Enter target settings manually' }));

    await waitFor(() => {
      expect(screen.getByTestId('ec2-target-az-input')).toHaveFocus();
    });
    expect(screen.getByTestId('ec2-auto-target-credentials-checkbox')).not.toBeChecked();
  });

  it('creates only one provider while a submission is in flight', async () => {
    const pendingTarget: { resolve?: (target: Ec2ResolvedTarget) => void } = {};
    mockedResolve.mockReturnValue(
      new Promise<Ec2ResolvedTarget>((resolve) => {
        pendingTarget.resolve = resolve;
      }),
    );
    await fillAndEnableAutoDetect();
    const createButton = screen.getByTestId('provider-create-button');

    await submit();
    await waitFor(() => {
      expect(createButton).toBeDisabled();
    });
    fireEvent.click(createButton);

    pendingTarget.resolve?.({ targetAz: 'us-east-1a', targetRegion: 'us-east-1' });
    await waitFor(() => {
      expect(mockCreateProvider).toHaveBeenCalledTimes(1);
    });
  });
});
