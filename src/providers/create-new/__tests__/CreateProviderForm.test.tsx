import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import CreateProviderForm from '../CreateProviderForm';

const mockNavigate = jest.fn();
jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@utils/analytics/hooks/useForkliftAnalytics', () => ({
  useForkliftAnalytics: () => ({
    trackEvent: jest.fn(),
  }),
}));

const mockCreateProvider = jest.fn();
const mockCreateProviderSecret = jest.fn();
const mockPatchProviderSecretOwner = jest.fn();

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
  const React = jest.requireActual('react');
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

      return React.createElement(
        'div',
        null,
        React.createElement('label', { htmlFor: 'provider-type-select' }, 'Provider type'),
        React.createElement(
          'select',
          { id: 'provider-type-select', 'data-testid': 'provider-type-select', ...field },
          React.createElement('option', { value: '' }, 'Select a provider type'),
          React.createElement(
            'option',
            { value: 'openshift', 'data-testid': 'provider-type-option-openshift' },
            'OpenShift Virtualization',
          ),
          React.createElement(
            'option',
            { value: 'ova', 'data-testid': 'provider-type-option-ova' },
            'OVA',
          ),
        ),
      );
    },
  };
});

describe('CreateProviderForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial rendering', () => {
    it('renders provider project and provider type fields', () => {
      render(<CreateProviderForm />);

      expect(screen.getByText('Provider project')).toBeInTheDocument();
      expect(screen.getByLabelText(/provider type/i)).toBeInTheDocument();
    });

    it('disables create button when form is invalid', () => {
      render(<CreateProviderForm />);

      const submitButton = screen.getByRole('button', { name: /create provider/i });
      expect(submitButton).toBeDisabled();
    });

    it('does not show provider name field before selecting type', () => {
      render(<CreateProviderForm />);

      expect(screen.queryByRole('textbox', { name: /provider name/i })).not.toBeInTheDocument();
    });
  });

  describe('OpenShift provider', () => {
    it('shows OpenShift-specific fields after selecting OpenShift type', async () => {
      const user = userEvent.setup();
      render(<CreateProviderForm />);

      const typeSelect = screen.getByLabelText(/provider type/i);
      await user.selectOptions(typeSelect, 'openshift');

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /api endpoint url/i })).toBeInTheDocument();
        expect(
          screen.getByRole('radio', { name: /skip certificate validation/i }),
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('textbox', { name: /service account bearer token/i }),
      ).not.toBeInTheDocument();
    });

    it('shows bearer token field when URL is provided for remote cluster', async () => {
      const user = userEvent.setup();
      render(<CreateProviderForm />);

      await user.selectOptions(screen.getByLabelText(/provider type/i), 'openshift');

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /api endpoint url/i })).toBeInTheDocument();
      });

      const urlInput = screen.getByRole('textbox', { name: /api endpoint url/i });
      await user.type(urlInput, 'https://api.example.com:6443');

      await waitFor(() => {
        expect(screen.getByLabelText(/service account bearer token/i)).toBeInTheDocument();
      });
    });

    it('hides OVA fields when OpenShift provider is selected', async () => {
      const user = userEvent.setup();
      render(<CreateProviderForm />);

      await user.selectOptions(screen.getByLabelText(/provider type/i), 'openshift');

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /api endpoint url/i })).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/nfs shared directory/i)).not.toBeInTheDocument();
    });
  });

  describe('OVA provider', () => {
    it('shows OVA-specific fields after selecting OVA type', async () => {
      const user = userEvent.setup();
      render(<CreateProviderForm />);

      await user.selectOptions(screen.getByLabelText(/provider type/i), 'ova');

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/nfs shared directory/i)).toBeInTheDocument();
      });
    });

    it('hides OpenShift fields when OVA provider is selected', async () => {
      const user = userEvent.setup();
      render(<CreateProviderForm />);

      await user.selectOptions(screen.getByLabelText(/provider type/i), 'ova');

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
      });

      expect(screen.queryByRole('textbox', { name: /api endpoint url/i })).not.toBeInTheDocument();
      expect(
        screen.queryByRole('textbox', { name: /service account bearer token/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('radio', { name: /skip certificate validation/i }),
      ).not.toBeInTheDocument();
    });
  });
});
