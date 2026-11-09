import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('CreateProviderForm - EC2 recovery', () => {
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

  it('keeps typed manual target settings when the recovery action is reused', async () => {
    mockedResolve.mockRejectedValue(new Ec2TargetResolutionError('nodesForbidden'));
    await fillAndEnableAutoDetect();
    await submit();

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Enter target settings manually' }));
    await user.type(await screen.findByTestId('ec2-target-az-input'), 'us-east-1a');
    await user.click(await screen.findByRole('button', { name: 'Enter target settings manually' }));

    expect(screen.getByTestId('ec2-target-az-input')).toHaveValue('us-east-1a');
  });

  it('does not create resources when the user cancels a pending submission', async () => {
    const pendingTarget: { resolve?: (target: Ec2ResolvedTarget) => void } = {};
    mockedResolve.mockReturnValue(
      new Promise<Ec2ResolvedTarget>((resolve) => {
        pendingTarget.resolve = resolve;
      }),
    );
    await fillAndEnableAutoDetect();
    await submit();

    const user = userEvent.setup();
    await user.click(screen.getByTestId('provider-cancel-button'));

    pendingTarget.resolve?.({ targetAz: 'us-east-1a', targetRegion: 'us-east-1' });
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(mockCreateProviderSecret).not.toHaveBeenCalled();
    expect(mockCreateProvider).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
