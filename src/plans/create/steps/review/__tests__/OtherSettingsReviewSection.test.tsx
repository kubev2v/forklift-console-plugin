import { FormProvider, useForm } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { GeneralFormFieldId } from '../../general-information/constants';
import { OtherSettingsFormFieldId } from '../../other-settings/constants';
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
}: {
  sourceProvider: any;
  nbdeClevis?: boolean;
  diskPassPhrases?: any[];
}) => {
  const methods = useForm({
    defaultValues: {
      [GeneralFormFieldId.SourceProvider]: sourceProvider,
      [OtherSettingsFormFieldId.NBDEClevis]: nbdeClevis,
      [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: diskPassPhrases,
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
      <OtherSettingsReviewSection />
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

  it('shows passphrases when NBDE is disabled', () => {
    const diskPassPhrases = [{ value: 'test-pass' }];
    render(<TestWrapper sourceProvider={vsphereProvider} diskPassPhrases={diskPassPhrases} />);

    expect(screen.getByText('Disk decryption passphrases')).toBeInTheDocument();
    expect(screen.getByText('test-pass')).toBeInTheDocument();
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
});
