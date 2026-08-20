import type { ReactElement, ReactNode } from 'react';

import {
  mockCreateProvider,
  mockCreateProviderSecret,
  mockNavigate,
  mockPatchProviderSecretOwner,
  mockSearchParams,
} from './test-utils';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): typeof mockNavigate => mockNavigate,
  useSearchParams: (): [URLSearchParams, jest.Mock] => [mockSearchParams, jest.fn()],
}));

jest.mock('@utils/analytics/hooks/useForkliftAnalytics', () => ({
  useForkliftAnalytics: (): { trackEvent: jest.Mock } => ({
    trackEvent: jest.fn(),
  }),
}));

jest.mock('src/providers/create/utils/createProvider', () => ({
  createProvider: (...args: unknown[]): unknown => mockCreateProvider(...args),
}));

jest.mock('src/providers/create/utils/createProviderSecret', () => ({
  createProviderSecret: (...args: unknown[]): unknown => mockCreateProviderSecret(...args),
}));

jest.mock('src/providers/create/utils/patchProviderSecretOwner', () => ({
  patchProviderSecretOwner: (...args: unknown[]): unknown => mockPatchProviderSecretOwner(...args),
}));

jest.mock('@utils/hooks/useWatchProjectNames', () => ({
  __esModule: true,
  default: (): [string[], boolean] => [['test-namespace'], true],
}));

jest.mock('../CreateProviderFormContextProvider', () => {
  const { CreateProviderFormContext } = jest.requireActual('../constants');
  return {
    __esModule: true,
    default: ({ children }: { children: ReactNode }): ReactElement => (
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
  useActiveNamespace: (): [string, jest.Mock] => ['test-namespace', jest.fn()],
  useK8sWatchResource: (): [unknown[], boolean, null] => [[], true, null],
  useOverlay: (): { hideModal: jest.Mock; isOpen: boolean; showModal: jest.Mock } => ({
    hideModal: jest.fn(),
    isOpen: false,
    showModal: jest.fn(),
  }),
  useAccessReview: (): [boolean, boolean] => [true, false],
  ProjectModel: {
    apiGroup: 'project.openshift.io',
    plural: 'projects',
  },
}));

jest.mock('@utils/hooks/useDefaultProject', () => ({
  useDefaultProject: (): string => 'test-namespace',
}));
