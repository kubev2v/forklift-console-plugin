import type { ReactElement } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, type RenderResult, screen } from '@testing-library/react';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { GeneralFormFieldId } from '../../general-information/constants';
import { DiskDecryptionType, OtherSettingsFormFieldId } from '../../other-settings/constants';
import OtherSettingsReviewSection from '../OtherSettingsReviewSection';

const mockUseCreatePlanFormContext = jest.fn();
jest.mock('../../../hooks/useCreatePlanFormContext', () => ({
  useCreatePlanFormContext: (): ReturnType<typeof mockUseCreatePlanFormContext> =>
    mockUseCreatePlanFormContext(),
}));

const mockIsFeatureEnabled = jest.fn();
jest.mock('@utils/hooks/useFeatureFlags', () => ({
  useFeatureFlags: (): { isFeatureEnabled: typeof mockIsFeatureEnabled } => ({
    isFeatureEnabled: mockIsFeatureEnabled,
  }),
}));

const mockGoToStepById = jest.fn();
jest.mock('@patternfly/react-core', () => ({
  ...jest.requireActual('@patternfly/react-core'),
  useWizardContext: (): { goToStepById: typeof mockGoToStepById } => ({
    goToStepById: mockGoToStepById,
  }),
}));

const EMPTY_DISK_PASS_PHRASES: unknown[] = [];
const vsphereProvider = { spec: { type: PROVIDER_TYPES.vsphere } };

type TestWrapperProps = {
  diskDecryptionType?: DiskDecryptionType;
  diskPassPhrases?: unknown[];
  existingLUKSSecret?: unknown;
  nbdeClevis?: boolean;
  offloadPopulatorPriorityClassName?: string;
  sourceProvider: unknown;
};

const TestWrapper = ({
  sourceProvider,
  nbdeClevis = false,
  diskPassPhrases = EMPTY_DISK_PASS_PHRASES,
  diskDecryptionType = DiskDecryptionType.New,
  existingLUKSSecret,
  offloadPopulatorPriorityClassName,
}: TestWrapperProps): ReactElement => {
  const methods = useForm({
    defaultValues: {
      [GeneralFormFieldId.SourceProvider]: sourceProvider,
      [OtherSettingsFormFieldId.NBDEClevis]: nbdeClevis,
      [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: diskPassPhrases,
      [OtherSettingsFormFieldId.DiskDecryptionType]: diskDecryptionType,
      [OtherSettingsFormFieldId.ExistingLUKSSecret]: existingLUKSSecret,
      [OtherSettingsFormFieldId.OffloadPopulatorPriorityClassName]:
        offloadPopulatorPriorityClassName,
      [OtherSettingsFormFieldId.TransferNetwork]: null,
      [OtherSettingsFormFieldId.PreserveStaticIps]: true,
      [OtherSettingsFormFieldId.RootDevice]: '',
      [OtherSettingsFormFieldId.MigrateSharedDisks]: false,
      [OtherSettingsFormFieldId.TargetPowerState]: { label: 'Running' },
    },
  });

  mockUseCreatePlanFormContext.mockReturnValue({ control: methods.control });

  return (
    <FormProvider {...methods}>
      <OtherSettingsReviewSection isLiveMigrationFeatureEnabled={false} />
    </FormProvider>
  );
};

const renderVsphereReview = (props: Omit<TestWrapperProps, 'sourceProvider'> = {}): RenderResult =>
  render(<TestWrapper {...props} sourceProvider={vsphereProvider} />);

describe('OtherSettingsReviewSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsFeatureEnabled.mockReturnValue(true);
  });

  it('shows abbreviated NBDE label', () => {
    render(<TestWrapper sourceProvider={vsphereProvider} />);
    expect(screen.getByText('Use NBDE/Clevis')).toBeInTheDocument();
  });

  it('shows Enabled/Disabled status for NBDE', () => {
    render(<TestWrapper nbdeClevis={false} sourceProvider={vsphereProvider} />);
    expect(screen.getByTestId('review-nbde-clevis')).toHaveTextContent('Disabled');
  });

  it('shows Enabled status when NBDE is true', () => {
    render(<TestWrapper nbdeClevis={true} sourceProvider={vsphereProvider} />);
    expect(screen.getByTestId('review-nbde-clevis')).toHaveTextContent('Enabled');
  });

  it('shows passphrase count when NBDE is disabled', () => {
    const diskPassPhrases = [{ value: 'test-pass' }];
    render(<TestWrapper diskPassPhrases={diskPassPhrases} sourceProvider={vsphereProvider} />);

    expect(screen.getByText('Disk decryption passphrases')).toBeInTheDocument();
    expect(screen.getByTestId('review-disk-decryption-passphrases')).toHaveTextContent(
      'passphrase configured',
    );
  });

  it('hides passphrases when NBDE is enabled', () => {
    const diskPassPhrases = [{ value: 'test-pass' }];
    renderVsphereReview({ diskPassPhrases, nbdeClevis: true });

    expect(screen.queryByText('Disk decryption passphrases')).not.toBeInTheDocument();
    expect(screen.queryByText('test-pass')).not.toBeInTheDocument();
  });

  it('shows "None" when no passphrases and NBDE disabled', () => {
    render(<TestWrapper diskPassPhrases={[]} sourceProvider={vsphereProvider} />);

    expect(screen.getByTestId('review-disk-decryption-passphrases')).toHaveTextContent('None');
  });

  it('hides NBDE fields for non-vSphere providers', () => {
    const nonVsphereProvider = { spec: { type: PROVIDER_TYPES.ovirt } };
    render(<TestWrapper sourceProvider={nonVsphereProvider} />);

    expect(screen.queryByText('Use NBDE/Clevis')).not.toBeInTheDocument();
  });

  it('shows the selected offload populator priority class', () => {
    renderVsphereReview({ offloadPopulatorPriorityClassName: 'high-priority' });

    expect(screen.getByTestId('review-offload-populator-priority-class')).toHaveTextContent(
      'high-priority',
    );
  });

  it('shows the cluster default when no offload populator priority class is set', () => {
    renderVsphereReview();

    expect(screen.getByTestId('review-offload-populator-priority-class')).toHaveTextContent(
      'Cluster default',
    );
  });

  it('hides the offload populator priority class when copy offload is disabled', () => {
    mockIsFeatureEnabled.mockReturnValue(false);
    renderVsphereReview();

    expect(screen.queryByTestId('review-offload-populator-priority-class')).not.toBeInTheDocument();
  });

  it('shows existing secret name when diskDecryptionType is Existing', () => {
    const existingSecret = { metadata: { name: 'my-luks-secret' } };
    renderVsphereReview({
      diskDecryptionType: DiskDecryptionType.Existing,
      existingLUKSSecret: existingSecret,
    });

    expect(screen.getByTestId('review-existing-luks-secret')).toHaveTextContent('my-luks-secret');
    expect(screen.queryByText('Disk decryption passphrases')).not.toBeInTheDocument();
  });

  it('shows passphrase count when diskDecryptionType is New', () => {
    const diskPassPhrases = [{ value: 'pass-1' }];
    renderVsphereReview({ diskDecryptionType: DiskDecryptionType.New, diskPassPhrases });

    expect(screen.getByTestId('review-disk-decryption-passphrases')).toHaveTextContent(
      'passphrase configured',
    );
    expect(screen.queryByTestId('review-existing-luks-secret')).not.toBeInTheDocument();
  });
});
