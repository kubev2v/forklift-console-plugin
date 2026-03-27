import {
  mockCreateProvider,
  mockCreateProviderSecret,
  mockNavigate,
  mockPatchProviderSecretOwner,
  mockSearchParams,
} from './test-utils';

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams, jest.fn()],
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
