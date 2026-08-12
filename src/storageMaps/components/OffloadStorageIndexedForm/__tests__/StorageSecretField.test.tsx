import { describe, expect, it, jest } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { renderWithForm } from '@test-utils/renderWithForm';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StorageSecretField from '../StorageSecretField';

mockI18n();

const mockUseK8sWatchResource = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(() => ({ group: '', kind: 'Secret', version: 'v1' })),
  useK8sWatchResource: jest.fn((...args: unknown[]) => mockUseK8sWatchResource(...args)),
}));

const sourceProvider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name: 'vsphere-provider', namespace: 'openshift-mtv' },
};

describe('StorageSecretField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists only Opaque secrets in the dropdown', async () => {
    const user = userEvent.setup();
    mockUseK8sWatchResource.mockReturnValue([
      [
        { metadata: { name: 'storage-creds', uid: 'uid-1' }, type: 'Opaque' },
        { metadata: { name: 'tls-secret', uid: 'uid-2' }, type: 'kubernetes.io/tls' },
        { metadata: { name: 'pull-secret', uid: 'uid-3' }, type: 'kubernetes.io/dockercfg' },
        {
          metadata: { name: 'sa-token', uid: 'uid-4' },
          type: 'kubernetes.io/service-account-token',
        },
      ],
      true,
      null,
    ]);

    renderWithForm(<StorageSecretField fieldId="storageSecret" sourceProvider={sourceProvider} />);

    await user.click(screen.getByRole('button', { name: 'Select menu toggle' }));

    expect(screen.getByRole('option', { name: 'storage-creds' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'tls-secret' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'pull-secret' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'sa-token' })).not.toBeInTheDocument();
  });

  it('shows empty message when only non-Opaque secrets exist', async () => {
    const user = userEvent.setup();
    mockUseK8sWatchResource.mockReturnValue([
      [{ metadata: { name: 'tls-secret', uid: 'uid-2' }, type: 'kubernetes.io/tls' }],
      true,
      null,
    ]);

    renderWithForm(<StorageSecretField fieldId="storageSecret" sourceProvider={sourceProvider} />);

    await user.click(screen.getByRole('button', { name: 'Select menu toggle' }));

    expect(screen.getByText('No secrets available for this provider')).toBeInTheDocument();
  });
});
