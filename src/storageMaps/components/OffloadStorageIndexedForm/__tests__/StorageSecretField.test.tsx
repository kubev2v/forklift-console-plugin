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
}));

jest.mock('@utils/hooks/useK8sWatchResource', () => ({
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

  it('includes secrets with missing type (K8s default Opaque)', async () => {
    const user = userEvent.setup();
    mockUseK8sWatchResource.mockReturnValue([
      [{ metadata: { name: 'default-type-secret', uid: 'uid-5' } }],
      true,
      null,
    ]);

    renderWithForm(<StorageSecretField fieldId="storageSecret" sourceProvider={sourceProvider} />);

    await user.click(screen.getByRole('button', { name: 'Select menu toggle' }));

    expect(screen.getByRole('option', { name: 'default-type-secret' })).toBeInTheDocument();
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

    expect(screen.getByText('No Opaque secrets found in this project.')).toBeInTheDocument();
  });

  it('shows empty message when secrets list is empty', async () => {
    const user = userEvent.setup();
    mockUseK8sWatchResource.mockReturnValue([[], true, null]);

    renderWithForm(<StorageSecretField fieldId="storageSecret" sourceProvider={sourceProvider} />);

    await user.click(screen.getByRole('button', { name: 'Select menu toggle' }));

    expect(screen.getByText('No Opaque secrets found in this project.')).toBeInTheDocument();
  });

  it('disables the select while secrets are loading', () => {
    mockUseK8sWatchResource.mockReturnValue([undefined, false, null]);

    renderWithForm(<StorageSecretField fieldId="storageSecret" sourceProvider={sourceProvider} />);

    expect(screen.getByRole('button', { name: 'Select menu toggle' })).toBeDisabled();
    expect(screen.getByText('Loading secrets...')).toBeInTheDocument();
  });

  it('disables the select and shows failure copy when watch errors with no secrets', () => {
    mockUseK8sWatchResource.mockReturnValue([[], true, new Error('watch failed')]);

    renderWithForm(<StorageSecretField fieldId="storageSecret" sourceProvider={sourceProvider} />);

    expect(screen.getByRole('button', { name: 'Select menu toggle' })).toBeDisabled();
    expect(screen.getByText('Failed to load secrets.')).toBeInTheDocument();
  });

  it('keeps the select enabled when Opaque secrets loaded despite watch error', async () => {
    const user = userEvent.setup();
    mockUseK8sWatchResource.mockReturnValue([
      [{ metadata: { name: 'storage-creds', uid: 'uid-1' }, type: 'Opaque' }],
      true,
      new Error('watch stream failed'),
    ]);

    renderWithForm(<StorageSecretField fieldId="storageSecret" sourceProvider={sourceProvider} />);

    const toggle = screen.getByRole('button', { name: 'Select menu toggle' });
    expect(toggle).toBeEnabled();
    expect(toggle).toHaveTextContent('Select storage secret');

    await user.click(toggle);

    expect(screen.getByRole('option', { name: 'storage-creds' })).toBeInTheDocument();
  });

  it('clears a stale non-Opaque secret value from the form', () => {
    mockUseK8sWatchResource.mockReturnValue([
      [
        { metadata: { name: 'storage-creds', uid: 'uid-1' }, type: 'Opaque' },
        { metadata: { name: 'tls-secret', uid: 'uid-2' }, type: 'kubernetes.io/tls' },
      ],
      true,
      null,
    ]);

    renderWithForm(<StorageSecretField fieldId="storageSecret" sourceProvider={sourceProvider} />, {
      defaultValues: { storageSecret: 'tls-secret' },
    });

    expect(screen.getByRole('button', { name: 'Select menu toggle' })).toHaveTextContent(
      'Select storage secret',
    );
    expect(screen.queryByText('tls-secret')).not.toBeInTheDocument();
  });

  it('clears a stale selection when the loaded list has no Opaque secrets', () => {
    mockUseK8sWatchResource.mockReturnValue([
      [{ metadata: { name: 'tls-secret', uid: 'uid-2' }, type: 'kubernetes.io/tls' }],
      true,
      null,
    ]);

    renderWithForm(<StorageSecretField fieldId="storageSecret" sourceProvider={sourceProvider} />, {
      defaultValues: { storageSecret: 'tls-secret' },
    });

    expect(screen.getByRole('button', { name: 'Select menu toggle' })).toHaveTextContent(
      'Select storage secret',
    );
    expect(screen.queryByText('tls-secret')).not.toBeInTheDocument();
  });
});
