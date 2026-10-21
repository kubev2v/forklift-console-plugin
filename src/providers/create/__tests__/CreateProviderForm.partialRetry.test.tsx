import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './setup-provider-form-mocks';

import CreateProviderForm from '../CreateProviderForm';

import { mockCreateProviderTypeField, mockSearchParams } from './test-utils';

jest.mock('../fields/ProviderTypeField', (): unknown => {
  const { mockCreateProviderTypeField: createMock } = jest.requireActual('./test-utils');
  return createMock('vsphere', 'VMware vSphere');
});
jest.mock('../hooks/useCreateProviderWorkflow', (): object => ({
  useCreateProviderWorkflow: (): object => ({
    apiError: new Error('Provider rejected'),
    createdProvider: undefined,
    isDeploying: false,
    isProviderPersisted: false,
    isSecretCreated: true,
    onCreate: (): Promise<boolean> => Promise.resolve(false),
    onDeploy: (): Promise<void> => Promise.resolve(),
  }),
}));

describe('CreateProviderForm after a Secret-only failure', () => {
  beforeEach(() => {
    mockSearchParams.set('providerType', 'vsphere');
    expect(mockCreateProviderTypeField).toEqual(expect.any(Function));
  });

  afterEach(() => {
    mockSearchParams.delete('providerType');
  });

  it('locks Secret and identity fields while allowing disk transfer and endpoint changes', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    expect(screen.getByTestId('provider-name-input')).toBeDisabled();
    expect(screen.getByTestId('provider-type-select')).toBeDisabled();
    expect(screen.getByTestId('vsphere-url-input')).toBeDisabled();
    expect(screen.getByTestId('vsphere-endpoint-esxi-radio')).toBeEnabled();
    expect(screen.getByTestId('disk-transfer-configure-radio')).toBeEnabled();

    await user.click(screen.getByTestId('disk-transfer-configure-radio'));
    await user.click(screen.getByTestId('vddk-setup-skip-radio'));
    expect(screen.getByTestId('vddk-setup-skip-radio')).toBeChecked();
  });
});
