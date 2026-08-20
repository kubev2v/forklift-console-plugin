import type { ReactElement } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { GeneralFormFieldId } from '../../general-information/constants';
import { DiskDecryptionType, OtherSettingsFormFieldId } from '../constants';
import OtherSettingsStep from '../OtherSettingsStep';

const mockUseCreatePlanFormContext = jest.fn();
jest.mock('../../../hooks/useCreatePlanFormContext', () => ({
  useCreatePlanFormContext: (): ReturnType<typeof mockUseCreatePlanFormContext> =>
    mockUseCreatePlanFormContext(),
}));

jest.mock('../InstanceTypeField', () => (): ReactElement => (
  <div data-testid="instance-type-field" />
));
jest.mock('../NBDEClevisField', () => (): ReactElement => <div data-testid="nbde-field" />);
jest.mock('../DiskPassPhraseFieldTable', () => (): ReactElement => (
  <div data-testid="passphrase-field" />
));
jest.mock('../ExistingLUKSSecretField', () => (): ReactElement => (
  <div data-testid="existing-luks-field" />
));
jest.mock('../TransferNetworkField', () => (): ReactElement => (
  <div data-testid="transfer-field" />
));
jest.mock('../PreserveStaticIpsField', () => (): ReactElement => (
  <div data-testid="static-ips-field" />
));
jest.mock('../RootDeviceField', () => (): ReactElement => <div data-testid="root-device-field" />);
jest.mock('../SharedDisksField', () => (): ReactElement => (
  <div data-testid="shared-disks-field" />
));
jest.mock('../TargetPowerStateField', () => (): ReactElement => (
  <div data-testid="power-state-field" />
));

const TestWrapper = ({
  sourceProvider,
  nbdeClevis = false,
}: {
  nbdeClevis?: boolean;
  sourceProvider: any;
}): ReactElement => {
  const methods = useForm({
    defaultValues: {
      [GeneralFormFieldId.SourceProvider]: sourceProvider,
      [OtherSettingsFormFieldId.NBDEClevis]: nbdeClevis,
      [OtherSettingsFormFieldId.DiskDecryptionType]: DiskDecryptionType.New,
    },
  });

  mockUseCreatePlanFormContext.mockReturnValue({ control: methods.control });

  return (
    <FormProvider {...methods}>
      <OtherSettingsStep isLiveMigrationFeatureEnabled={false} />
    </FormProvider>
  );
};

describe('OtherSettingsStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows passphrase field when NBDE is disabled', () => {
    const vsphereProvider = { spec: { type: PROVIDER_TYPES.vsphere } };
    render(<TestWrapper nbdeClevis={false} sourceProvider={vsphereProvider} />);

    expect(screen.getByTestId('nbde-field')).toBeInTheDocument();
    expect(screen.getByTestId('passphrase-field')).toBeInTheDocument();
  });

  it('hides passphrase field when NBDE is enabled', () => {
    const vsphereProvider = { spec: { type: PROVIDER_TYPES.vsphere } };
    render(<TestWrapper nbdeClevis={true} sourceProvider={vsphereProvider} />);

    expect(screen.getByTestId('nbde-field')).toBeInTheDocument();
    expect(screen.queryByTestId('passphrase-field')).not.toBeInTheDocument();
  });

  it('only shows common fields for non-vSphere providers', () => {
    const nonVsphereProvider = { spec: { type: PROVIDER_TYPES.ovirt } };
    render(<TestWrapper sourceProvider={nonVsphereProvider} />);

    expect(screen.getByTestId('transfer-field')).toBeInTheDocument();
    expect(screen.getByTestId('power-state-field')).toBeInTheDocument();
    expect(screen.queryByTestId('nbde-field')).not.toBeInTheDocument();
  });

  it('reactively hides passphrase field when NBDE is toggled', async () => {
    const vsphereProvider = { spec: { type: PROVIDER_TYPES.vsphere } };
    const DynamicWrapper = (): ReactElement => {
      const methods = useForm({
        defaultValues: {
          [GeneralFormFieldId.SourceProvider]: vsphereProvider,
          [OtherSettingsFormFieldId.NBDEClevis]: false,
          [OtherSettingsFormFieldId.DiskDecryptionType]: DiskDecryptionType.New,
        },
      });

      mockUseCreatePlanFormContext.mockReturnValue({ control: methods.control });

      return (
        <FormProvider {...methods}>
          <button
            data-testid="toggle-nbde"
            onClick={() => {
              methods.setValue(OtherSettingsFormFieldId.NBDEClevis, true);
            }}
          >
            Toggle
          </button>
          <OtherSettingsStep isLiveMigrationFeatureEnabled={false} />
        </FormProvider>
      );
    };

    const user = userEvent.setup();
    render(<DynamicWrapper />);

    expect(screen.getByTestId('passphrase-field')).toBeInTheDocument();

    await user.click(screen.getByTestId('toggle-nbde'));

    expect(screen.queryByTestId('passphrase-field')).not.toBeInTheDocument();
  });
});
