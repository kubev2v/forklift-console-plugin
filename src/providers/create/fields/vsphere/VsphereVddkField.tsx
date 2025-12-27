import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import { useForkliftTranslation } from '@utils/i18n';

import VDDKRadioSelection from '../../../components/VDDKRadioSelection';
import { VddkSetupMode } from '../../../utils/constants';
import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';

import { validateVddkInitImage } from './vsphereFieldValidators';

const VsphereVddkField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, watch } = useCreateProviderFormContext();

  const vddkImageValue = watch(ProviderFormFieldId.VsphereVddkInitImage);

  return (
    <Controller
      control={control}
      name={ProviderFormFieldId.VsphereVddkSetupMode}
      rules={{
        required: t('VDDK setup selection is required'),
        validate: {
          validImage: (mode: VddkSetupMode | undefined) => {
            if (mode === VddkSetupMode.Skip) {
              return undefined;
            }
            if (mode === VddkSetupMode.Manual) {
              return validateVddkInitImage(vddkImageValue);
            }
            return undefined;
          },
        },
      }}
      render={() => <VDDKRadioSelection />}
    />
  );
};

export default VsphereVddkField;
