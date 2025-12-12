import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import CreateProviderForm from '../CreateProviderForm';

import {
  clearAllProviderMocks,
  mockCreateProvider,
  mockCreateProviderSecret,
  mockNavigate,
  mockPatchProviderSecretOwner,
} from './test-utils';

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@utils/analytics/hooks/useForkliftAnalytics', () => ({
  useForkliftAnalytics: () => ({
    trackEvent: jest.fn(),
  }),
}));

jest.mock('src/providers/create/utils/createProvider', () => ({
  createProvider: (...args: unknown[]) => mockCreateProvider(...args),
}));

jest.mock('src/providers/create/utils/createProviderSecret', () => ({
  createProviderSecret: (...args: unknown[]) => mockCreateProviderSecret(...args),
}));

jest.mock('src/providers/create/utils/patchProviderSecretOwner', () => ({
  patchProviderSecretOwner: (...args: unknown[]) => mockPatchProviderSecretOwner(...args),
}));

jest.mock('@utils/hooks/useWatchProjectNames', () => ({
  __esModule: true,
  default: () => [['test-namespace'], true],
}));

jest.mock('../CreateProviderFormContextProvider', () => {
  const { CreateProviderFormContext } = jest.requireActual('../constants');
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
      <CreateProviderFormContext.Provider
        value={{
          providerNames: ['existing-provider'],
          providerNamesLoaded: true,
        }}
      >
        {children}
      </CreateProviderFormContext.Provider>
    ),
  };
});

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useActiveNamespace: () => ['test-namespace', jest.fn()],
  useK8sWatchResource: () => [[], true, null],
  useModal: () => ({ isOpen: false, showModal: jest.fn(), hideModal: jest.fn() }),
  useAccessReview: () => [true, false],
  ProjectModel: {
    apiGroup: 'project.openshift.io',
    plural: 'projects',
  },
}));

jest.mock('@utils/hooks/useDefaultProject', () => ({
  useDefaultProject: () => 'test-namespace',
}));

jest.mock('../fields/ProviderTypeField', () => {
  const { useController } = jest.requireActual('react-hook-form');
  const { useCreateProviderFormContext } = jest.requireActual(
    '../hooks/useCreateProviderFormContext',
  );

  return {
    __esModule: true,
    default: () => {
      const { control } = useCreateProviderFormContext();
      const { field } = useController({
        control,
        name: 'providerType',
      });

      return (
        <div>
          <label htmlFor="provider-type-select">Provider type</label>
          <select id="provider-type-select" data-testid="provider-type-select" {...field}>
            <option value="">Select a provider type</option>
            <option value="vsphere">VMware vSphere</option>
          </select>
        </div>
      );
    },
  };
});

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
