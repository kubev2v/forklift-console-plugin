import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ProviderData } from '@utils/providers/types';

const mockLaunchOverlay = jest.fn();
const mockWatch = jest.fn((_config: unknown) => [
  {},
  false,
  Object.assign(new Error('not found'), {
    code: 404,
    json: {
      details: {
        group: 'forklift.konveyor.io',
        kind: 'copyappliancetemplates',
        name: 'source-copy-appliance-template',
      },
      reason: 'NotFound',
    },
  }),
]);

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  useAccessReview: () => [true, false],
  useOverlay: () => mockLaunchOverlay,
}));
jest.mock('@utils/hooks/useFeatureFlags', (): unknown => ({
  useFeatureFlags: () => ({ isFeatureEnabled: () => true }),
}));
jest.mock('@utils/hooks/useK8sWatchResource', (): unknown => ({
  useK8sWatchResource: (config: unknown) => mockWatch(config),
}));
jest.mock('src/utils/i18n', (): unknown => ({
  t: (key: string): string => key,
  useForkliftTranslation: () => ({ t: (key: string): string => key }),
}));
jest.mock('src/components/DetailItems/DetailItem', (): unknown => ({
  DetailsItem: ({ content, testId }: { content: React.ReactNode; testId: string }) => (
    <div data-testid={testId}>{content}</div>
  ),
}));

import DiskTransferSection from '../DiskTransferSection';

const provider = {
  metadata: {
    annotations: { [DISK_TRANSFER_METHOD_ANNOTATION]: VddkSetupMode.CopyAppliance },
    name: 'source',
    namespace: 'ns',
  },
  spec: { settings: {}, type: 'vsphere' },
} as unknown as V1beta1Provider;

const data: ProviderData = {
  permissions: { canCreate: true, canDelete: true, canGet: true, canPatch: true, loading: false },
  provider,
};

it('allows pending setup after a named watch confirms the template is absent', () => {
  render(<DiskTransferSection data={data} />);

  expect(mockWatch).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'source-copy-appliance-template' }),
  );
  fireEvent.click(screen.getByTestId('disk-transfer-edit-button'));
  expect(mockLaunchOverlay).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ templateLookupUnavailable: false }),
  );
});
