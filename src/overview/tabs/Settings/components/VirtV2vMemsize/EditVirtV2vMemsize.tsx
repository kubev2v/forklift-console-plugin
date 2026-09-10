import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultValuesMap } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsNumberInput from '../SettingsNumberInput/SettingsNumberInput';
import { validateSettingsNumberInput } from '../SettingsNumberInput/utils/validateSettingsNumberInput';

import VirtV2vMemsizeHelpContent from './VirtV2vMemsizeHelpContent';

const EditVirtV2vMemsize: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <Controller
      control={control}
      name={SettingsFields.VirtV2vMemsize}
      render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
        <FormGroupWithHelpText
          fieldId={SettingsFields.VirtV2vMemsize}
          helperText={t(
            'Enter the memory allocation size in megabytes for the conversion appliance. If empty, the default value will be used.',
          )}
          helperTextInvalid={error?.message}
          label={t('Conversion appliance memory (MB)')}
          labelHelp={
            <HelpIconPopover header={t('Conversion appliance memory')}>
              <VirtV2vMemsizeHelpContent />
            </HelpIconPopover>
          }
          validated={getInputValidated(error)}
        >
          <SettingsNumberInput
            defaultValue={Number(defaultValuesMap[SettingsFields.VirtV2vMemsize])}
            onBlur={() => {
              onBlur();
              if (error) {
                onChange(defaultValuesMap[SettingsFields.VirtV2vMemsize]);
              }
            }}
            onChange={(val) => {
              onChange(Number(val));
            }}
            testId="settings-virt-v2v-memsize-input"
            validated={getInputValidated(error)}
            value={value ?? 0}
          />
        </FormGroupWithHelpText>
      )}
      rules={{ validate: (value) => validateSettingsNumberInput(value, 0) }}
    />
  );
};

export default EditVirtV2vMemsize;
