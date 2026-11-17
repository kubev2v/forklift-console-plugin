import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import VDDKRadioSelection from '../../../components/VDDKRadioSelection';
import { VddkSetupMode } from '../../../utils/constants';
import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';

import { validateVsphereDiskTransfer } from './vsphereFieldValidators';

const VsphereVddkField: FC = () => {
  const { control, getValues } = useCreateProviderFormContext();

  return (
    <Controller
      control={control}
      defaultValue={VddkSetupMode.Manual}
      name={ProviderFormFieldId.VsphereVddkSetupMode}
      render={() => <VDDKRadioSelection />}
      rules={{
        validate: (mode: VddkSetupMode | undefined) =>
          validateVsphereDiskTransfer(mode, getValues(ProviderFormFieldId.VsphereVddkInitImage)),
      }}
    />
  );
};

export default VsphereVddkField;
