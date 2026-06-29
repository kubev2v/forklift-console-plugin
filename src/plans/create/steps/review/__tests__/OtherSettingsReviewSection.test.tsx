import { FormProvider, useForm } from 'react-hook-form';

import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { GeneralFormFieldId } from '../../general-information/constants';
import { DiskDecryptionType, OtherSettingsFormFieldId } from '../../other-settings/constants';
import OtherSettingsReviewSection from '../OtherSettingsReviewSection';

const mockUseCreatePlanFormContext = jest.fn();
jest.mock('../../../hooks/useCreatePlanFormContext', () => ({
  useCreatePlanFormContext: () => mockUseCreatePlanFormContext(),
}));

const mockGoToStepById = jest.fn();
jest.mock('@patternfly/react-core', () => ({
  ...jest.requireActual('@patternfly/react-core'),
  useWizardContext: () => ({ goToStepById: mockGoToStepById }),
}));

const TestWrapper = ({
  sourceProvider,
  nbdeClevis = false,
  diskPassPhrases = [],
  diskDecryptionType = DiskDecryptionType.New,
  existingLUKSSecret,
}: {
  sourceProvider: any;
  nbdeClevis?: boolean;
  diskPassPhrases?: any[];
  diskDecryptionType?: DiskDecryptionType;
  existingLUKSSecret?: any;
}) => {
  const methods = useForm({
    defaultValues: {
      [GeneralFormFieldId.SourceProvider]: sourceProvider,
      [OtherSettingsFormFieldId.NBDEClevis]: nbdeClevis,
      [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: diskPassPhrases,
      [OtherSettingsFormFieldId.DiskDecryptionType]: diskDecryptionType,
      [OtherSettingsFormFieldId.ExistingLUKSSecret]: existingLUKSSecret,
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

describe('OtherSettingsReviewSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const vsphereProvider = { spec: { type: PROVIDER_TYPES.vsphere } };

  it('shows abbreviated NBDE label', () => {
    render(<TestWrapper sourceProvider={vsphereProvider} />);
    expect(screen.getByText('Use NBDE/Clevis')).toBeInTheDocument();
  });

  it('shows Enabled/Disabled status for NBDE', () => {
    render(<TestWrapper sourceProvider={vsphereProvider} nbdeClevis={false} />);
    expect(screen.getByTestId('review-nbde-clevis')).toHaveTextContent('Disabled');
  });

  it('shows Enabled status when NBDE is true', () => {
    render(<TestWrapper sourceProvider={vsphereProvider} nbdeClevis={true} />);
    expect(screen.getByTestId('review-nbde-clevis')).toHaveTextContent('Enabled');
  });

  it('shows passphrase count when NBDE is disabled', () => {
    const diskPassPhrases = [{ value: 'test-pass' }];
    render(<TestWrapper sourceProvider={vsphereProvider} diskPassPhrases={diskPassPhrases} />);

    expect(screen.getByText('Disk decryption passphrases')).toBeInTheDocument();
    expect(screen.getByTestId('review-disk-decryption-passphrases')).toHaveTextContent(
      'passphrase configured',
    );
  });

  it('hides passphrases when NBDE is enabled', () => {
    const diskPassPhrases = [{ value: 'test-pass' }];
    render(
      <TestWrapper
        sourceProvider={vsphereProvider}
        nbdeClevis={true}
        diskPassPhrases={diskPassPhrases}
      />,
    );

    expect(screen.queryByText('Disk decryption passphrases')).not.toBeInTheDocument();
    expect(screen.queryByText('test-pass')).not.toBeInTheDocument();
  });

  it('shows "None" when no passphrases and NBDE disabled', () => {
    render(<TestWrapper sourceProvider={vsphereProvider} diskPassPhrases={[]} />);

    expect(screen.getByTestId('review-disk-decryption-passphrases')).toHaveTextContent('None');
  });

  it('hides NBDE fields for non-vSphere providers', () => {
    const nonVsphereProvider = { spec: { type: PROVIDER_TYPES.ovirt } };
    render(<TestWrapper sourceProvider={nonVsphereProvider} />);

    expect(screen.queryByText('Use NBDE/Clevis')).not.toBeInTheDocument();
  });

  it('shows existing secret name when diskDecryptionType is Existing', () => {
    const existingSecret = { metadata: { name: 'my-luks-secret' } };
    render(
      <TestWrapper
        sourceProvider={vsphereProvider}
        diskDecryptionType={DiskDecryptionType.Existing}
        existingLUKSSecret={existingSecret}
      />,
    );

    expect(screen.getByTestId('review-existing-luks-secret')).toHaveTextContent('my-luks-secret');
    expect(screen.queryByText('Disk decryption passphrases')).not.toBeInTheDocument();
  });

  it('shows passphrase count when diskDecryptionType is New', () => {
    const diskPassPhrases = [{ value: 'pass-1' }];
    render(
      <TestWrapper
        sourceProvider={vsphereProvider}
        diskDecryptionType={DiskDecryptionType.New}
        diskPassPhrases={diskPassPhrases}
      />,
    );

    expect(screen.getByTestId('review-disk-decryption-passphrases')).toHaveTextContent(
      'passphrase configured',
    );
    expect(screen.queryByTestId('review-existing-luks-secret')).not.toBeInTheDocument();
  });
});
