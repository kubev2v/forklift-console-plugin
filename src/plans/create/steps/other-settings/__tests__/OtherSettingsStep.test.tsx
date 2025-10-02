import { FormProvider, useForm } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { GeneralFormFieldId } from '../../general-information/constants';
import { OtherSettingsFormFieldId } from '../constants';
import OtherSettingsStep from '../OtherSettingsStep';

const mockUseCreatePlanFormContext = jest.fn();
jest.mock('../../../hooks/useCreatePlanFormContext', () => ({
  useCreatePlanFormContext: () => mockUseCreatePlanFormContext(),
}));

jest.mock('../NBDEClevisField', () => () => <div data-testid="nbde-field" />);
jest.mock('../DiskPassPhraseFieldTable', () => () => <div data-testid="passphrase-field" />);
jest.mock('../TransferNetworkField', () => () => <div data-testid="transfer-field" />);
jest.mock('../PreserveStaticIpsField', () => () => <div data-testid="static-ips-field" />);
jest.mock('../RootDeviceField', () => () => <div data-testid="root-device-field" />);
jest.mock('../SharedDisksField', () => () => <div data-testid="shared-disks-field" />);
jest.mock('../TargetPowerStateField', () => () => <div data-testid="power-state-field" />);

const TestWrapper = ({
  sourceProvider,
  nbdeClevis = false,
}: {
  sourceProvider: any;
  nbdeClevis?: boolean;
}) => {
  const methods = useForm({
    defaultValues: {
      [GeneralFormFieldId.SourceProvider]: sourceProvider,
      [OtherSettingsFormFieldId.NBDEClevis]: nbdeClevis,
    },
  });

  mockUseCreatePlanFormContext.mockReturnValue({ control: methods.control });

  return (
    <FormProvider {...methods}>
      <OtherSettingsStep />
    </FormProvider>
  );
};

describe('OtherSettingsStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows passphrase field when NBDE is disabled', () => {
    const vsphereProvider = { spec: { type: PROVIDER_TYPES.vsphere } };
    render(<TestWrapper sourceProvider={vsphereProvider} nbdeClevis={false} />);

    expect(screen.getByTestId('nbde-field')).toBeInTheDocument();
    expect(screen.getByTestId('passphrase-field')).toBeInTheDocument();
  });

  it('hides passphrase field when NBDE is enabled', () => {
    const vsphereProvider = { spec: { type: PROVIDER_TYPES.vsphere } };
    render(<TestWrapper sourceProvider={vsphereProvider} nbdeClevis={true} />);

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
    const DynamicWrapper = () => {
      const methods = useForm({
        defaultValues: {
          [GeneralFormFieldId.SourceProvider]: vsphereProvider,
          [OtherSettingsFormFieldId.NBDEClevis]: false,
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
          <OtherSettingsStep />
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
