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
            <option value="ovirt">Red Hat Virtualization</option>
          </select>
        </div>
      );
    },
  };
});

describe('CreateProviderForm - oVirt Provider', () => {
  beforeEach(() => {
    clearAllProviderMocks();
  });

  it('shows oVirt-specific fields after selecting oVirt type', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'ovirt');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
      expect(screen.getByTestId('ovirt-url-input')).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /skip certificate validation/i }),
      ).toBeInTheDocument();
    });

    expect(screen.queryByTestId('ovirt-username-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ovirt-password-input')).not.toBeInTheDocument();
  });

  it('shows credentials fields when URL is provided', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'ovirt');

    await waitFor(() => {
      expect(screen.getByTestId('ovirt-url-input')).toBeInTheDocument();
    });

    const urlInput = screen.getByTestId('ovirt-url-input');
    await user.type(urlInput, 'https://rhv.example.com/ovirt-engine/api');

    await waitFor(() => {
      expect(screen.getByTestId('ovirt-username-input')).toBeInTheDocument();
      expect(screen.getByTestId('ovirt-password-input')).toBeInTheDocument();
    });
  });

  it('hides other provider fields when oVirt provider is selected', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'ovirt');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('textbox', { name: /service account bearer token/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/nfs shared directory/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('openstack-url-input')).not.toBeInTheDocument();
  });
});
