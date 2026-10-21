import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1CopyApplianceTemplate, V1beta1Provider } from '@forklift-ui/types';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ProviderData } from '@utils/providers/types';

let mockCopyApplianceEnabled = true;
let mockTemplate: V1beta1CopyApplianceTemplate | undefined;
let mockWatchError: Error | undefined;
const mockLaunchOverlay = jest.fn();
const mockWatch = jest.fn((config: unknown) =>
  config ? [mockTemplate ?? {}, true, mockWatchError] : [undefined, false, undefined],
);

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  useAccessReview: () => [true, false],
  useOverlay: () => mockLaunchOverlay,
}));
jest.mock('@utils/hooks/useFeatureFlags', (): unknown => ({
  useFeatureFlags: () => ({ isFeatureEnabled: () => mockCopyApplianceEnabled }),
}));
jest.mock('@utils/hooks/useK8sWatchResource', (): unknown => ({
  useK8sWatchResource: (config: unknown) => mockWatch(config),
}));
jest.mock('src/utils/i18n', (): unknown => ({
  t: (key: string): string => key,
  useForkliftTranslation: () => ({ t: (key: string): string => key }),
}));
jest.mock('src/components/DetailItems/DetailItem', (): unknown => ({
  DetailsItem: ({
    content,
    testId,
    title,
  }: {
    content: React.ReactNode;
    testId: string;
    title: string;
  }) => (
    <div data-testid={testId}>
      {title}: {content}
    </div>
  ),
}));
jest.mock('../../DetailsSection/CopyApplianceTemplateDetailsItem', (): unknown => ({
  __esModule: true,
  default: () => <div data-testid="copy-appliance-template-detail-item" />,
}));
jest.mock('../../DetailsSection/CopyApplianceSSHSecretsDetailsItem', (): unknown => ({
  __esModule: true,
  default: () => <div data-testid="copy-appliance-ssh-secrets-detail-item" />,
}));

import DiskTransferSection from '../DiskTransferSection';

const provider = (pending: boolean, image?: string, placement = false): V1beta1Provider =>
  ({
    metadata: {
      annotations: pending
        ? { [DISK_TRANSFER_METHOD_ANNOTATION]: VddkSetupMode.CopyAppliance }
        : undefined,
      name: 'source',
      namespace: 'ns',
    },
    spec: {
      settings: {
        ...(placement ? { copyApplianceDatastore: 'datastore-1' } : {}),
        sdkEndpoint: 'esxi',
        vddkInitImage: image,
      },
      type: 'vsphere',
    },
  }) as unknown as V1beta1Provider;

const data = (pending: boolean, image?: string, placement = false): ProviderData => ({
  permissions: { canCreate: true, canDelete: true, canGet: true, canPatch: true, loading: false },
  provider: provider(pending, image, placement),
});

const template = {
  metadata: { name: 'source-copy-appliance-template', namespace: 'ns' },
} as V1beta1CopyApplianceTemplate;

describe('DiskTransferSection', () => {
  beforeEach(() => {
    mockCopyApplianceEnabled = true;
    mockTemplate = undefined;
    mockWatchError = undefined;
    mockWatch.mockClear();
    mockLaunchOverlay.mockClear();
  });

  it('shows incomplete warning for a pending appliance without a template', () => {
    render(<DiskTransferSection data={data(true)} />);

    expect(screen.getByText('Copy appliance setup is incomplete')).toBeInTheDocument();
    expect(screen.getByTestId('disk-transfer-method')).toHaveTextContent('Copy appliance');
  });

  it('shows explicit skip without an appliance warning', () => {
    mockWatchError = new Error('CRD unavailable');
    render(<DiskTransferSection data={data(false)} />);

    expect(screen.getByTestId('disk-transfer-method')).toHaveTextContent(
      'Skip disk transfer setup',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByTestId('disk-transfer-appliance-status')).not.toBeInTheDocument();
    expect(screen.getByTestId('disk-transfer-edit-button')).not.toBeDisabled();
  });

  it('keeps VDDK details and editing available when copy appliance is disabled', () => {
    mockCopyApplianceEnabled = false;

    render(<DiskTransferSection data={data(false, 'quay.io/vddk:latest')} />);

    expect(mockWatch).toHaveBeenCalledWith(null);
    expect(screen.getByTestId('disk-transfer-method')).toHaveTextContent('VDDK image');
    expect(screen.getByTestId('disk-transfer-edit-button')).not.toBeDisabled();
    expect(screen.queryByText('Unable to load copy appliance templates')).not.toBeInTheDocument();
  });

  it('shows VDDK fields and allows editing when the template watch fails', () => {
    mockWatchError = new Error('CRD unavailable');
    render(<DiskTransferSection data={data(false, 'quay.io/vddk:latest')} />);

    expect(screen.getByTestId('disk-transfer-method')).toHaveTextContent('VDDK image');
    expect(screen.getByTestId('disk-transfer-vddk-image')).toHaveTextContent('quay.io/vddk:latest');
    expect(screen.getByTestId('disk-transfer-aio')).toHaveTextContent('Disabled');
    expect(screen.queryByTestId('disk-transfer-appliance-status')).not.toBeInTheDocument();
    expect(screen.queryByText('Unable to load copy appliance templates')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('disk-transfer-edit-button'));
    expect(mockLaunchOverlay).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        templateLookupUnavailable: true,
      }),
    );
  });

  it('keeps the pending appliance warning visible when the template watch fails', () => {
    mockWatchError = new Error('CRD unavailable');
    render(<DiskTransferSection data={data(true)} />);

    expect(screen.getByText('Copy appliance setup is incomplete')).toBeInTheDocument();
    expect(screen.getByTestId('disk-transfer-appliance-status')).toHaveTextContent(
      'Not configured',
    );
    expect(screen.queryByTestId('disk-transfer-datastore')).not.toBeInTheDocument();
    expect(screen.getByTestId('disk-transfer-edit-button')).not.toBeDisabled();
  });

  it('shows placement and template only for a configured appliance', () => {
    mockTemplate = template;
    render(<DiskTransferSection data={data(true, undefined, true)} />);

    expect(screen.getByTestId('disk-transfer-appliance-status')).toHaveTextContent('Configured');
    expect(screen.getByTestId('disk-transfer-datastore')).toHaveTextContent('datastore-1');
    expect(screen.getByTestId('copy-appliance-template-detail-item')).toBeInTheDocument();
    expect(screen.queryByTestId('disk-transfer-vddk-image')).not.toBeInTheDocument();
  });

  it('shows only VDDK fields when a VDDK image and template both exist', () => {
    mockTemplate = template;
    render(<DiskTransferSection data={data(true, 'quay.io/vddk:latest', true)} />);

    expect(screen.getByTestId('disk-transfer-method')).toHaveTextContent('VDDK image');
    expect(screen.queryByTestId('disk-transfer-datastore')).not.toBeInTheDocument();
    expect(screen.queryByTestId('copy-appliance-template-detail-item')).not.toBeInTheDocument();
  });
});
