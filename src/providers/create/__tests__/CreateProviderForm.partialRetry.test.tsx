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
    canCreateCopyApplianceTemplate: true,
    createdProvider: undefined,
    isDeploying: false,
    isProviderPersisted: false,
    isSecretCreated: true,
    onCancel: (): Promise<void> => Promise.resolve(),
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

  it('keeps fields editable after a Secret-only failure so retry can recreate the Secret', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    expect(screen.getByTestId('provider-name-input')).toBeEnabled();
    expect(screen.getByTestId('provider-type-select')).toBeEnabled();
    expect(screen.getByTestId('vsphere-url-input')).toBeEnabled();
    expect(screen.getByTestId('vsphere-endpoint-esxi-radio')).toBeEnabled();
    expect(screen.getByTestId('disk-transfer-configure-radio')).toBeEnabled();

    await user.click(screen.getByTestId('disk-transfer-configure-radio'));
    await user.click(screen.getByTestId('vddk-setup-skip-radio'));
    expect(screen.getByTestId('vddk-setup-skip-radio')).toBeChecked();
  });
});
